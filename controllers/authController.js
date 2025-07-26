const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "Username or email already exists"
            });
        }

        const user = await User.create({ username, email, password });

        // Create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username }).select("+password");
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        // Check if password is correct
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Request password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Get user based on email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "No user found with that email address"
            });
        }

        // 2. Generate random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // 3. Set token expiration (10 minutes)
        const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetPasswordToken = passwordResetToken;
        user.resetPasswordExpires = passwordResetExpires;
        await user.save({ validateBeforeSave: false });

        // 4. Send email with reset token
        const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                message
            });

            res.status(200).json({
                status: "success",
                message: 'Token sent to email!'
            });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                status: "error",
                message: 'There was an error sending the email. Try again later!'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        // 1. Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        // 2. If token has not expired, and there is user, set the new password
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: 'Token is invalid or has expired'
            });
        }

        // 3. Update password property for the user
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // 4. Log the user in, send JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Change password when logged in
const updatePassword = async (req, res) => {
    try {
        // 1. Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // 2. Check if posted current password is correct
        if (!(await user.isValidPassword(req.body.currentPassword))) {
            return res.status(401).json({
                status: "error",
                message: 'Your current password is wrong'
            });
        }

        // 3. If so, update password
        user.password = req.body.newPassword;
        await user.save();

        // 4. Log user in, send JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

module.exports = { 
    register, 
    login, 
    forgotPassword, 
    resetPassword, 
    updatePassword 
};