const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [200, 'Content should be at least 200 characters']
  },
  excerpt: {
    type: String,
    maxlength: [200, 'Excerpt cannot exceed 200 characters']
  },
  featuredImage: {
    public_id: String,
    url: String
  },
  categories: [{
    type: String,
    enum: ['Health Tips', 'Medical News', 'Patient Stories', 'Preventive Care']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
  this.slug = this.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  next();
});

module.exports = mongoose.model('Blog', blogSchema);