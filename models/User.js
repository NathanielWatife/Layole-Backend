const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const blogUserConnection = require("../config/blogUserDb");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "A User must have a username"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "A User must have an email"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"],
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "A User must have a password"],
        minlength: 8,
        select: false,
    },
    profileImage: {
        type: String,
        default: "",
        trim: true,
    },
    bio: {
        type: String,
        default: "",
        trim: true,
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
        },
    ],
    resetPasswordToken: {
        type: String,
        default: "",
    },
    resetPasswordExpires: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
    // hash the password before saving
    this.password = await bcrypt.hash(this.password, 12);
    this.updatedAt = Date.now();
    next();
});


// Use the separate connection for this model
module.exports = blogUserConnection.model("User", userSchema);