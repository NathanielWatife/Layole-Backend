const Blog = require("../models/Blog");
const User = require("../models/User");


// get all published blog
exports.getAllPublishedBlog = async (req, res) => {
    try {
        const blogs = await Blog.find({ state: "published" });

        res.status(200).json({
            status: "Success",
            blogs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while fetching blogs.",
        });
    }
};


// get a single blog post
exports.getASinglePublishedBlog = async (req, res) =>{
    try {
        const blog = await Blog.findById(req.params.blogId)
        .where("state")
        .eq("published");

        if (!blog){
            return res.status(404).json({
                status: "Error",
                message: "Blog not found or is not published.",
            });
        } else {
            // increase th readCount property
            blog.readCount === 0 ? blog.readCount++ : post.readCount++;
            await blog.save();
        }
        res.status(200).json({
            status: "Success",
            blog,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while fetching the blog.",
        });
    }
};

// create new blog
exports.createABlog = async (req, res) => {
    try {
        const { title, description, tags, body, image } = req.body;

        // calculate the read time of the blog post
        const wpm = 225;
        const numberOfWords = body.trim().split(/\s+/).length;
        const readTime = Math.ceil(numberOfWords / wpm);

        // get authhor name and id
        let { username } = req.user;
        let author = `${username}`;
        let authorId = req.user._id;
        const blog = await Blog.create({
            title,
            description,
            tags,
            body,
            author,
            authorId,
            readTime,
            image,
        });

        // add new blog to blogs array property of the user
        let user = await User.findById(req.user._id);
        user.blogs.push(blog._id);
        await user.save();

        res.status(201).json({
            status: "Success",
            message: "Blog created successfully",
            blog,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while creating the blog.",
        });
    }
};


// update a blog post
exports.updateABlog = async (req, res) => {
    const { title, description, body, state, image } = req.body;
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.blogId,
            {$set: { title, description, body, state, image }},
            { new: true }
        );
        // check if blog exists
        if (blog.authorId.toString() !== req.user._id) {
            return res.status(403).json({
                status: "Error",
                message: "You are not authorized to update this blog.",
            });
        }
        res.status(200).json({
            status: "Success",
            message: "Blog updated successfully",
            blog,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while updating the blog.",
        });
    }
};



// delete blog post
exports.deleteABlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.blogId, {
            authorId: req.user._id,
        });

        if (!blog) return res.status(404).json({
            status: "Error",
            message: "Blog not found or you are not authorized to delete this blog.",
        });

        if (blog.authorId.toString() !== req.user._id) {
            return res.status(403).json({
                status: "Error",
                message: "You are not authorized to delete this blog.",
            });
        }

        // delete post from user's blogs array
        const blogByUser = await User.findById(req.user._id);
        blogByUser.blogs.pull(blog._id);
        await blogByUser.updateOne({
            blogs: blogByUser.blogs,
        });
        res.status(200).json({
            status: "Success",
            message: "Blog deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "An error occurred while deleting the blog.",
        });
    }
};