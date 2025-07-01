const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const upload = require('../utils/multer');

const router = express.Router();

// public routes 
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// protected routes
router.use(authController.protect);
// admin routes
router.use(authController.restrictTo('admin', 'editor'));

router.post(
    '/',
    upload.single('featuredImage'),
    blogController.createBlog
);

router.patch(
    '/:id',
    upload.single('featuredImage'),
    blogController.updateBlog
);

router.delete('/:id', blogController.deleteBlog);

module.exports = router;