const mongoose = require('mongoose');
const slugify = require('slugify');

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
    url: String,
    required: [true, 'Featured image is required']
  },
  categories: [{
    type: String,
    enum: ['Health Tips', 'Medical News', 'Patient Stories', 'Prevention', 'Treatment'],
    required: true
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
  metaTitle: String,
  metaDescription: String,
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  next();
});

// Add virtual for related posts (example implementation)
blogSchema.virtual('related', {
  ref: 'Blog',
  localField: 'categories',
  foreignField: 'categories',
  justOne: false,
  options: { 
    limit: 3,
    sort: { publishedAt: -1 },
    match: { 
      status: 'published',
      _id: { $ne: this._id } 
    }
  }
});

module.exports = mongoose.model('Blog', blogSchema);