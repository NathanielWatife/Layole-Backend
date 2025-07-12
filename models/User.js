const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "A User must have a username"]        
    },
    email: {
        type: String,
        required: [true, "A User must have an email"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "A User must have a password"],
        minlength: 8,
        select: false
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
        },
    ],
});



// Encrypt password before saving
userSchema.pre("save", async function (next) {
    // hash the password before saving
    this.password =  await bcrypt.hash(this.password, 12);
    next();
});

// Method to check if password is correct
userSchema.methods.isValidPassword = async function (currentPassword, storeUserPassword) {
    return await bcrypt.compare(currentPassword, storeUserPassword);
};


// create user model object
const User = mongoose.model("User", userSchema);
module.exports = User;