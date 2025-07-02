const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title for blog is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 100 characters"]
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, "Blog content is required"],
        trim: true,
        minlenght: [50, "Content must be at least 50 characters long"],
    },
    excerpt: {
        type: String,
        maxlength: [200, "Excerpt cannot exceed 200 characters"],
    },
    featuredImage:{
        public_id: String,
        url: String
    },
    categories: {
        type: [String],
        validate: function(val) {
            return val.length <= 5;
        },
        message: 'A blog can have a maximum of 5 categories'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "Admin",
        required: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Create slug before saving
blogSchema.pre('save', function(next) {
    if (!this.isModified('title')) return next();
    
    this.slug = slugify(this.title, { 
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
    });
    next();
});

// Update timestamp when status changes to published
blogSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = Date.now();
    }
    next();
});

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ categories: 1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;