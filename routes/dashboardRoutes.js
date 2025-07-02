const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/auth');
const { validateBlog } = require('../middleware/validation');
const upload = require('../utils/upload');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlog);

// Protected routes (require authentication)
router.use(authMiddleware.protect);

// Admin dashboard routes
router.get('/stats/overview', blogController.getBlogStats);
router.get('/author/:authorId', blogController.getBlogsByAuthor);

// CRUD operations
router.post('/', 
    upload.single('featuredImage'), 
    validateBlog, 
    blogController.createBlog
);

router.patch('/:id', 
    upload.single('featuredImage'), 
    validateBlog, 
    authMiddleware.checkBlogOwnership,
    blogController.updateBlog
);

router.delete('/:id', 
    authMiddleware.checkBlogOwnership,
    blogController.deleteBlog
);

module.exports = router;