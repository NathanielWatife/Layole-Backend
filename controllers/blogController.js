const Blog = require("../models/Blog");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require('cloudinary').v2;
const slugify = require('slugify');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload image to Cloudinary
const uploadImage = async (file) => {
    return await cloudinary.uploader.upload(file.path, {
        folder: 'layole-hospital/blogs',
        width: 1200,
        crop: 'scale'
    });
};

// Create new blog post
exports.createBlog = catchAsync(async (req, res, next) => {
    const { title, content, excerpt, categories, status } = req.body;

    // Upload image if exists
    let featuredImage = {};
    if (req.file) {
        const result = await uploadImage(req.file);
        featuredImage = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    // Create slug
    const slug = slugify(title, { lower: true });

    // Check for existing slug
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
        return next(new AppError('A blog with this title already exists', 400));
    }

    // Create blog
    const blog = await Blog.create({
        title,
        slug,
        content,
        excerpt,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        featuredImage,
        author: req.user.id,
        status,
        publishedAt: status === 'published' ? Date.now() : null
    });

    res.status(201).json({
        status: 'success',
        data: {
            blog
        }
    });
});

// Get all blogs (with filtering)
exports.getAllBlogs = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Base query
    const query = {};

    // Filter by status (default to published for non-admins)
    if (req.user?.role === 'admin') {
        query.status = req.query.status || { $in: ['published', 'draft'] };
    } else {
        query.status = 'published';
    }

    // Filter by category
    if (req.query.category) {
        query.categories = req.query.category;
    }

    // Search functionality
    if (req.query.search) {
        query.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { content: { $regex: req.query.search, $options: 'i' } },
            { excerpt: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Execute query
    const blogs = await Blog.find(query)
        .sort('-publishedAt')
        .skip(skip)
        .limit(limit)
        .populate('author', 'username');

    const total = await Blog.countDocuments(query);

    res.status(200).json({
        status: 'success',
        results: blogs.length,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        },
        data: {
            blogs
        }
    });
});

// Get single blog by slug
exports.getBlog = catchAsync(async (req, res, next) => {
    const blog = await Blog.findOne({ slug: req.params.slug })
        .populate('author', 'username');

    if (!blog) {
        return next(new AppError('No blog found with that slug', 404));
    }

    // Don't show drafts to non-authors/admins
    if (blog.status === 'draft' && 
        (!req.user || (req.user.id !== blog.author.id && req.user.role !== 'admin'))) {
        return next(new AppError('No blog found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            blog
        }
    });
});

// Update blog post
exports.updateBlog = catchAsync(async (req, res, next) => {
    const { title, content, excerpt, categories, status } = req.body;

    // Find blog
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    // Check permissions
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to update this blog', 403));
    }

    // Handle image update
    if (req.file) {
        // Delete old image if exists
        if (blog.featuredImage?.public_id) {
            await cloudinary.uploader.destroy(blog.featuredImage.public_id);
        }

        // Upload new image
        const result = await uploadImage(req.file);
        blog.featuredImage = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    // Update fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.categories = categories ? categories.split(',').map(cat => cat.trim()) : blog.categories;
    blog.status = status || blog.status;
    
    // Update slug if title changed
    if (title && title !== blog.title) {
        blog.slug = slugify(title, { lower: true });
    }

    // Update publishedAt if status changed to published
    if (status === 'published' && blog.status !== 'published') {
        blog.publishedAt = Date.now();
    }

    await blog.save();

    res.status(200).json({
        status: 'success',
        data: {
            blog
        }
    });
});

// Delete blog post
exports.deleteBlog = catchAsync(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    // Check permissions
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to delete this blog', 403));
    }

    // Delete image from Cloudinary if exists
    if (blog.featuredImage?.public_id) {
        await cloudinary.uploader.destroy(blog.featuredImage.public_id);
    }

    await blog.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get blog statistics for dashboard
exports.getBlogStats = catchAsync(async (req, res, next) => {
    const stats = await Blog.aggregate([
        {
            $facet: {
                totalCount: [{ $count: "count" }],
                statusCounts: [
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ],
                monthlyCounts: [
                    { 
                        $match: { 
                            createdAt: { 
                                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) 
                            } 
                        } 
                    },
                    {
                        $group: {
                            _id: { 
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ],
                topCategories: [
                    { $unwind: "$categories" },
                    { $group: { _id: "$categories", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ],
                recentActivity: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            title: 1,
                            status: 1,
                            createdAt: 1,
                            author: 1
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            total: stats[0].totalCount[0]?.count || 0,
            byStatus: stats[0].statusCounts,
            monthlyTrend: stats[0].monthlyCounts,
            topCategories: stats[0].topCategories,
            recentActivity: stats[0].recentActivity
        }
    });
});

// Get blogs by author
exports.getBlogsByAuthor = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({ author: req.params.authorId })
        .sort('-createdAt')
        .select('title status publishedAt slug')
        .populate('author', 'username');

    res.status(200).json({
        status: 'success',
        results: blogs.length,
        data: {
            blogs
        }
    });
});