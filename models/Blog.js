const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  source: { type: String, required: true },
  sourceUrl: { type: String },
  publishDate: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
  isApproved: { type: Boolean, default: true }
});

module.exports = mongoose.model('Blog', blogSchema);