const Admin = require("../models/Admin");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

// Rate limiter for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later"
});

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide username and password"
            });
        }

        const admin = await Admin.findOne({
            $or: [{ username }, { email: username }]
        }).select("+password");

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        if (admin.isLocked) {
            return res.status(423).json({
                success: false,
                error: "Account locked. Try again later or contact support"
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            await admin.incLoginAttempts();
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        await admin.resetLoginAttempts();
        const token = admin.generateToken();

        res.json({
            success: true,
            token,
            data: {
                id: admin._id,
                username: admin.username,
                fullName: admin.fullName,
                role: admin.role,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                error: "Admin not found"
            });
        }

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, email } = req.body;
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: "Admin not found"
            });
        }

        admin.firstName = firstName || admin.firstName;
        admin.lastName = lastName || admin.lastName;
        
        if (email && email !== admin.email) {
            admin.email = email;
            // Here you would add email verification logic
        }

        await admin.save();

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters"
            });
        }

        const admin = await Admin.findById(req.admin.id).select("+password");
        if (!admin) {
            return res.status(404).json({
                success: false,
                error: "Admin not found"
            });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: "Current password is incorrect"
            });
        }

        admin.password = newPassword;
        await admin.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // In a real app, you would invalidate the token here
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    loginLimiter,
    getProfile,
    updateProfile,
    changePassword,
    logout
};