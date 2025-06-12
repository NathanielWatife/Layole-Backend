const Admin = require("../models/Admin");
const Blog = require("../models/Blog")
const {  uploadImage } = require("../utils/cloudinary")

exports.createBlog = async (req, res, next) => {
    try {
        const { title, content, excerpt, status } = req.body;

        // image
        let featuredImage = {};
        if (req.file) {
            const result = await uploadImage(req.file);
            featuredImage = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const blog = await Blog.create({
            title,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            categories: categories ? categories.split(',') : [],
            featuredImage,
            author: req.admin.id,
            status,
            publishedAt: status === 'published' ? Date.now() : null
        })
        res.status(201).json({
            success: true,
            data: blog
        })
    } catch (error) {
        next(error)
    }
}

exports.getBlogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        const qury = {}

        if (status) uery.status = status
        if (category) query.categories = category

        const blogs = await Blog.find(query)
            .populate('author', 'firstName lastName')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit))
        
        res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs
        })
    } catch(error) {
        next(error)
    }
}


// update blog
exports.updateBlog = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const blogId = req.params.id
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: "Admin not found"
            })
        }
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found"
            })
        }
        blog.title = title || blog.title
        blog.content = content || blog.content

        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        })

    } catch (error) {
        next(error)
    }
}

// delete blog
exports.deleteBlog = async (req, res, next) => {
    try {
        const blogId = req.params.id
        const admin = await Admin.findById(req.admin.id)

        if(!admin){
            return res.status(404).json({
                success: false,
                error: "Blog not found"
            })
        }
        await blog.deleteBlog()
        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        })
    } catch(error){
        next(error);
    }
}

// get single blog
exports.getSingleBlog = async (req, res, next) => {
    try {
        const blogId = req.params.id
        const blog = await Blog.findById(blogId)

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found"
            })
        }
        res.status(200).json({
            success: true,
            data: blog
        })
    } catch (error){
        next(error)
    }
}