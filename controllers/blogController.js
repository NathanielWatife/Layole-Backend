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
        .skip(skip)
        .limit(limit);

    const total = await Blog.countDocuments(query);
    res.status(200).json({
        status: 'success',
        result: blogs.length,
        data: {
            blogs
        }
    });
});



// get a single blog post by slug
exports.getBlog = catchAsync(async (req, res, next) => {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
        return next (new AppError('No blog found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            blog
        }
    });
});


// update a blog post
exports.updateBlog = catchAsync(async (req, res, next) => {
    const { title, content, excerpt, categories, status } = req.body;
    // find the blog 
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    // check if user is author or admin
    if(blog.author.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new AppError('You are not authorized to update this blog', 403));
    }
    // image update
    if (req.file){
        // delete the old image from cloudinary
        if(blog.featuredImage.public_id){
            await cloudinary.uploader.destroy(blog.featuredImage.public_id);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'layole-hospital/blogs',
            width: 1200,
            crop: 'scale'
        });

        blog.featuredImage = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.categories = categories ? categories.split(',') : blog.categories;
    blog.status = status || blog.status;
    blog.publishedAt = status === 'published' ? Date.now() : blog.publishedAt;
    await blog.save();
    res.status(200).json({
        status: 'success',
        data: {
            blog
        }
    });
});


// delete blog
exports.deleteBlog = catchAsync(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    // check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to delete this blog', 403));
    }
    // delete the image from cloudinary
    if (blog.featuredImage.public_id) {
        await cloudinary.uploader.destroy(blog.featuredImage.public_id);
    }
    await blog.remove();
    res.status(204).json({
        status: 'success',
        data: null
    });
});