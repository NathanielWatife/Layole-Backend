const express = require('express');
const Article = require('../models/Article');
const router = express.Router();

// Get all approved articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ isApproved: true })
      .sort({ publishDate: -1 })
      .limit(10);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single article
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug,
      isApproved: true 
    });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;