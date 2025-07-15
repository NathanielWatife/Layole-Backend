const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware
exports.protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ status: "Error", message: "Not authorized." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        res.status(401).json({ status: "Error", message: "Invalid token." });
    }
};

// Password reset token validation middleware
exports.validateResetToken = async (req, res, next) => {
    const { token } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res.status(400).json({
            status: "Error",
            message: "Invalid or expired token.",
        });
    }
    req.user = user;
    next();
};
