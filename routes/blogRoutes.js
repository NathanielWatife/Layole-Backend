const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogController');

// Example routes
router.get('/', BlogController.getAllPublishedBlog);
router.get('/:id', BlogController.getASinglePublishedBlog);
router.post('/', BlogController.createABlog);
router.put('/:id', BlogController.updateABlog);
router.delete('/:id', BlogController.deleteABlog);

module.exports = router;
