const Admin = require("../models/Admin");
const rateLimit = require("express-rate-limit");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Rate limiter for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        res.status(429).json({
            status: "fail",
            message: "Too many login attempts, please try again later"

        });
    }
});

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if email and password exist
        if (!username || !password) {
            return next(new AppError('Please provide username and password', 400));
        }

        // Check if admin exists and password is correct
        const admin = await Admin.findOne({
            $or: [{ username }, { email: username }]
        }).select('+password +loginAttempts +lockUntil');

        if (!admin || !admin.isActive) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Check if account is locked
        if (admin.isLocked) {
            const retryAfter = Math.ceil((admin.lockUntil - Date.now()) / 60000);
            return next(
                new AppError(`Account locked. Try again in ${retryAfter} minute(s) or contact support`, 423)
            );
        }

        // check if password is correct
        if (!(await admin.correctPassword(password, admin.password))) {
            await admin.incLoginAttempts();
            const attemptsLeft = 5 - (admin.loginAttempts + 1);
            return next(
                new AppError(
                    `Invalid credentials. ${attemptsLeft} attempt(s) remaining`, 401
                )
            );
        }

        // If everything ok, reset attempts and send token
        await admin.resetLoginAttempts();
        const token = admin.generateAuthToken();

        // remove the sensitive data from output
        admin.password = undefined;
        admin.loginAttempts = undefined;
        admin;lockUntil = undefined;

        res.status(200).json({
            status: 'success',
            token,
            expiresIn: process.env.JWT_EXPIRES_IN,
            data: {
                admin
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id).select("-__v");
        if (!admin) {
            return next(new AppError('Admin not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                admin
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        // filter out the unwanted fields
        const filteredBody = {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        };
        // only allow email update if verified
        if (req.body.email){
            filteredBody.email = req.body.email;
            filteredBody.emailVerified = false;
        }

        const admin = await Admin.findByIdAndUpdate(
            req.admin.id, filteredBody,
            { 
                new: true,
                runValidators: true 
            }
        ).select("-__v");


        res.status(200).json({
            status: 'success',
            data: {
                admin
            }
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      // 1) Get admin from collection
      const admin = await Admin.findById(req.admin.id).select("+password");
  
      // 2) Check if current password is correct
      if (!(await admin.correctPassword(currentPassword, admin.password))) {
        return next(new AppError("Your current password is incorrect", 401));
      }
  
      // 3) Update password
      admin.password = newPassword;
      await admin.save();
  
      // 4) Generate new token (old token becomes invalid)
      const token = admin.generateAuthToken();
  
      res.status(200).json({
        status: "success",
        token,
        message: "Password updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  const forgotPassword = async (req, res, next) => {
    try {
      // 1) Get admin based on email
      const admin = await Admin.findOne({ email: req.body.email });
      if (!admin) {
        return next(
          new AppError("There is no admin with that email address", 404)
        );
      }
  
      // 2) Generate reset token
      const resetToken = admin.createPasswordResetToken();
      await admin.save({ validateBeforeSave: false });
  
      // 3) Send token via email
      try {
        const resetURL = `${req.protocol}://${req.get(
          "host"
        )}/api/v1/auth/reset-password/${resetToken}`;
  
        await new Email(admin, resetURL).sendPasswordReset();
  
        res.status(200).json({
          status: "success",
          message: "Password reset token sent to email"
        });
      } catch (err) {
        admin.passwordResetToken = undefined;
        admin.passwordResetExpires = undefined;
        await admin.save({ validateBeforeSave: false });
  
        return next(
          new AppError(
            "There was an error sending the email. Try again later!",
            500
          )
        );
      }
    } catch (error) {
      next(error);
    }
  };
  
  const resetPassword = async (req, res, next) => {
    try {
      // 1) Get admin based on token
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      const admin = await Admin.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
  
      // 2) If token not expired and admin exists, set new password
      if (!admin) {
        return next(new AppError("Token is invalid or has expired", 400));
      }
  
      admin.password = req.body.password;
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save();
  
      // 3) Log the admin in, send JWT
      const token = admin.generateAuthToken();
  
      res.status(200).json({
        status: "success",
        token,
        message: "Password reset successful"
      });
    } catch (error) {
      next(error);
    }
  };
  
  const logout = (req, res) => {
    // In production, you might invalidate the token here
    res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    });
  };


  const getAuthors = async (req, res, next) => {
    try {
      const authors = await Admin.find({ role: { $in: ['admin', 'author'] } })
        .select('username firstName lastName email');
      
      res.status(200).json({
        status: 'success',
        results: authors.length,
        data: {
          authors
        }
      });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    loginLimiter,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
    getAuthors
  };