const mongoose = require("mongoose");
const blogUserConnection = require("../config/blogUserDb");

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    body: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        default: "Anonymous",
        required: true,
        trim: true,
    },
    image: {
        type: String,
        default: "",
        trim: true,
    },
    readTime: {
        type: Number,
        default: 1,
    },
    readCount: {
        type: Number,
        default: 0,
    },
    state: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

BlogSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = blogUserConnection.model("Blog", BlogSchema);