const mongoose = require("mongoose");

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
    categories: [{
        type: String,
        enum: ['Medical Tips', 'Health News', 'Patient Stories', 'Disease Preventions']
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "Admin",
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// query middleware to populate author

blogSchema.pre('save', function(next) {
    this.slug = this.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    next();
});

// query middleware to populate author
blogSchema.pre('/^find/', function(next){
    this.populate({
        path: 'author',
        select: 'name email'
    });
    next();
});

module.exports = mongoose.model('Blog', blogSchema)