const Blog = require("../models/Blog");

exports.getAllPublishedBlog = async (req, res) => {
    try {
        const { search, tag } = req.query;
        let query = { state: "published" };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (tag) {
            query.tags = tag;
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            count: blogs.length,
            blogs
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

exports.getASinglePublishedBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { readCount: 1 } },
            { new: true }
        ).where("state").equals("published");

        if (!blog) {
            return res.status(404).json({
                status: "error",
                message: "Blog not found or is not published."
            });
        }

        res.status(200).json({
            status: "success",
            blog
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

exports.createABlog = async (req, res) => {
    try {
        const { title, description, tags, body, image, author } = req.body;

        // Calculate read time
        const wpm = 225;
        const numberOfWords = body.trim().split(/\s+/).length;
        const readTime = Math.ceil(numberOfWords / wpm);

        const blog = await Blog.create({
            title,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            body,
            author: author || "Anonymous",
            readTime,
            image,
            state: "published"
        });

        res.status(201).json({
            status: "success",
            message: "Blog created successfully",
            blog
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

exports.updateABlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({
                status: "error",
                message: "Blog not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Blog updated successfully",
            blog
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

exports.deleteABlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({
                status: "error",
                message: "Blog not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Blog deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};