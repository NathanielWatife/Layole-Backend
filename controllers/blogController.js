const Blog = require("../models/Blog");
const fs = require("fs");
const path = require("path");

// Get all blogs with filtering and pagination
exports.getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      state,
      tag,
      author,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter object
    const filter = {};
    if (state) filter.state = state;
    if (author) filter.author = author;
    if (tag) filter.tags = { $in: [tag] };

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      populate: "author",
    };

    const blogs = await Blog.find(filter)
      .populate("author", "username email")
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blogs",
    });
  }
};

// Get single blog
exports.getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate("author", "username email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog",
    });
  }
};

// Create new blog
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      tags,
      state,
      metaTitle,
      metaDescription,
    } = req.body;

    // Handle featured image upload
    let featuredImage = "";
    if (req.file) {
      featuredImage = `/public/uploads/${req.file.filename}`;
    }

    const blogData = {
      title,
      description,
      body,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      state: state || "draft",
      author: req.admin._id,
      authorName: req.admin.username,
      metaTitle,
      metaDescription,
    };

    if (featuredImage) {
      blogData.featuredImage = featuredImage;
    }

    const blog = new Blog(blogData);
    await blog.save();

    await blog.populate("author", "username email");

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating blog",
    });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      body,
      tags,
      state,
      metaTitle,
      metaDescription,
    } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Handle featured image upload
    if (req.file) {
      // Delete old image if exists
      if (blog.featuredImage) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          blog.featuredImage.replace("/", "")
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.featuredImage = `/public/uploads/${req.file.filename}`;
    }

    // Update fields
    if (title) blog.title = title;
    if (description) blog.description = description;
    if (body) blog.body = body;
    if (tags) blog.tags = tags.split(",").map((tag) => tag.trim());
    if (state) blog.state = state;
    if (metaTitle) blog.metaTitle = metaTitle;
    if (metaDescription) blog.metaDescription = metaDescription;

    await blog.save();
    await blog.populate("author", "username email");

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating blog",
    });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Delete associated image
    if (blog.featuredImage) {
      const imagePath = path.join(
        __dirname,
        "..",
        blog.featuredImage.replace("/", "")
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting blog",
    });
  }
};