const Blog = require("../models/Blog");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary =  require('cloudinary').v2;

// config cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// create new blog post
exports.createBlog = catchAsync(async (req, res, next) => {
    const { title, content, excerpt, categories, status } = req.body;

    // upload blog image to cloudinary if exists
    let featuredImage = {};
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'layole-hospital/blogs',
            width: 1200,
            crop: 'scale'
        });
        featuredImage = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    // create blog
    const blog = await Blog.create({
        title,
        content,
        excerpt,
        categories: categories ? categories.split(','): [],
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


// get all published blog
exports.getAllBlogs = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'published' };

    if (req.query.category) {
        query.categories = req.query.category;
    }

    if (req.query.search) {
        query.$or = [
            {title: {$regex: req.query.search, $options: 'i'}},
            {content: {$regrex: req.query.search, $options: 'i'}}
        ];
    }

    const blogs = await Blog.find(query)
        .sort('-publishedAt')
});