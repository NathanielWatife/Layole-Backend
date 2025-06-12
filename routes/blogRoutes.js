const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createBlog, getBlogs } = require('../controllers/blogController');
const upload = require('../utils/multer');

router.route('/')
  .post(protect, authorize('admin', 'editor'), upload.single('featuredImage'), createBlog)
  .get(getBlogs);

module.exports = router;