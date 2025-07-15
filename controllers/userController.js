const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate("blogs");
        res.status(200).json({
            status: "Success",
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while fetching users.",
        });
    }
};

// Get a single user
exports.getAUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate("blogs");
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found.",
            });
        }
        res.status(200).json({
            status: "Success",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while fetching the user.",
        });
    }
};

// Create a new user
exports.createAUser = async (req, res) => {
    try {
        const { username, email, password, profileImage, bio } = req.body;
        const user = await User.create({
            username,
            email,
            password,
            profileImage,
            bio,
        });
        res.status(201).json({
            status: "Success",
            message: "User created successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while creating the user.",
        });
    }
};

// Update a user
exports.updateAUser = async (req, res) => {
    try {
        const { username, email, password, profileImage, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { username, email, password, profileImage, bio } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found.",
            });
        }
        res.status(200).json({
            status: "Success",
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while updating the user.",
        });
    }
};

// Delete a user
exports.deleteAUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found.",
            });
        }
        res.status(200).json({
            status: "Success",
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while deleting the user.",
        });
    }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "No user found with that email.",
            });
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        // In production, send token via email. For now, return it.
        res.status(200).json({
            status: "Success",
            message: "Password reset token generated.",
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while requesting password reset.",
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
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
        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordToken = "";
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({
            status: "Success",
            message: "Password has been reset.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while resetting password.",
        });
    }
};
