const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  source: { type: String, required: true },
  sourceUrl: String,
  publishDate: { type: Date, default: Date.now },
  tags: [String],
  isApproved: { type: Boolean, default: true }
});

module.exports = mongoose.model('Article', articleSchema);