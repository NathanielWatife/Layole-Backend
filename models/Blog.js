const mongoose = require("mongoose");
const slugify = require("slugify");
const blogUserConnection = require("../config/blogUserDb");

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true,
        trim: true
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    authorName: {
        type: String,
        default: "Anonymous",
        trim: true,
    },

    image: {
        type: String,
        default: "",
        trim: true,
    },
    featuredImage: {
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
    metaTitle: {
        type: String,
        trim: true,
        maxlength: 200
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: 300
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

// generate slug from title before saving
BlogSchema.pre("save", function(next) {
    if (this.isModified("title") && this.title){
        this.slug = slugify(thi.title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });
    }
    if (this.isModified("title") &&  !this.metaTitle) {
        this.metaTitle = this.title;
    }

    if (this.isModified("description") && !this.metaDescription) {
        this.metaDescription = this.description.substring(0, 160);
    }

    this.updatedAt = Date.now();
    next();
})

module.exports = blogUserConnection.model("Blog", BlogSchema);