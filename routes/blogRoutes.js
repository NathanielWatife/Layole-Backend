const express = require('express');
const {
  getBlogs,
  getBlog,
  getRelatedBlogs,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/multer');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlog);
router.get('/:slug/related', getRelatedBlogs);

// Protected admin routes
router.use(protect);
router.use(authorize('admin', 'editor'));

router.get('/admin', getAdminBlogs);
router.post('/', upload.single('featuredImage'), createBlog);
router.put('/:id', upload.single('featuredImage'), updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;