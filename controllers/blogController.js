const Blog = require('../models/Blog');
const { uploadToCloudinary } = require('../utils/cloudinary');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category, search } = req.query;
  
  const query = { status: 'published' };
  if (category) query.categories = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const blogs = await Blog.find(query)
    .populate('author', 'firstName lastName')
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Blog.countDocuments(query);

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'firstName lastName')
    .lean();

  if (!blog) {
    return next(new ErrorResponse('Blog post not found', 404));
  }

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Get related blog posts
// @route   GET /api/blogs/:slug/related
// @access  Public
exports.getRelatedBlogs = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).lean();
  if (!blog) {
    return next(new ErrorResponse('Blog post not found', 404));
  }

  const related = await Blog.find({
    categories: { $in: blog.categories },
    status: 'published',
    _id: { $ne: blog._id }
  })
  .limit(3)
  .sort({ publishedAt: -1 })
  .lean();

  res.status(200).json({
    success: true,
    count: related.length,
    data: related
  });
});

// @desc    Get all blogs (admin)
// @route   GET /api/blogs/admin
// @access  Private/Admin
exports.getAdminBlogs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const blogs = await Blog.find(query)
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Blog.countDocuments(query);

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = asyncHandler(async (req, res, next) => {
  if (!req.files?.featuredImage) {
    return next(new ErrorResponse('Please upload a featured image', 400));
  }

  const imageResult = await uploadToCloudinary(req.files.featuredImage.tempFilePath);

  const blogData = {
    ...req.body,
    author: req.admin.id,
    featuredImage: {
      public_id: imageResult.public_id,
      url: imageResult.secure_url
    }
  };

  if (req.body.status === 'published') {
    blogData.publishedAt = new Date();
  }

  // Convert categories from string to array if needed
  if (typeof req.body.categories === 'string') {
    blogData.categories = req.body.categories.split(',').map(c => c.trim());
  }

  const blog = await Blog.create(blogData);

  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorResponse('Blog post not found', 404));
  }

  // Check if author or super admin
  if (blog.author.toString() !== req.admin.id && req.admin.role !== 'super-admin') {
    return next(new ErrorResponse('Not authorized to update this post', 403));
  }

  const updateData = { ...req.body };

  // Handle image upload if new image provided
  if (req.files?.featuredImage) {
    const imageResult = await uploadToCloudinary(req.files.featuredImage.tempFilePath);
    updateData.featuredImage = {
      public_id: imageResult.public_id,
      url: imageResult.secure_url
    };
  }

  // Handle status change to published
  if (req.body.status === 'published' && blog.status !== 'published') {
    updateData.publishedAt = new Date();
  }

  // Convert categories from string to array if needed
  if (typeof req.body.categories === 'string') {
    updateData.categories = req.body.categories.split(',').map(c => c.trim());
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorResponse('Blog post not found', 404));
  }

  // Check if author or super admin
  if (blog.author.toString() !== req.admin.id && req.admin.role !== 'super-admin') {
    return next(new ErrorResponse('Not authorized to delete this post', 403));
  }

  await blog.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});