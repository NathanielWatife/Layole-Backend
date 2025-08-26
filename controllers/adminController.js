const Admin = require("../models/Admin");
const Appointment = require("../models/Appointment");
const Contact = require("../models/Contact");
const Review = require("../models/Review");
const Blog = require("../models/Blog");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
    }

    // Find admin and include password for comparison
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    // Remove password from output
    const adminWithoutPassword = admin.toJSON();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Find admin with password
    const admin = await Admin.findById(req.admin._id).select("+password");

    // Check current password
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalAppointments,
      totalBlogs,
      totalReviews,
      unreadContacts,
      pendingAppointments,
      recentAppointments,
      recentContacts,
      latestReviews,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Blog.countDocuments(),
      Review.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("department", "name")
        .exec(),
      Contact.find().sort({ createdAt: -1 }).limit(5).exec(),
      Review.find().sort({ createdAt: -1 }).limit(5).exec(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          appointments: totalAppointments,
          blogs: totalBlogs,
          reviews: totalReviews,
          unreadContacts,
          pendingAppointments,
        },
        recentAppointments,
        recentContacts,
        latestReviews,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
    });
  }
};

// Appointment Management
exports.getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      dateFrom,
      dateTo,
      sortBy = "appointmentDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.appointmentDate = {};
      if (dateFrom) filter.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.appointmentDate.$lte = new Date(dateTo);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    };

    const appointments = await Appointment.find(filter)
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Update fields if provided
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating appointment",
    });
  }
};

// Contact Management
exports.getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isRead,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    };

    const contacts = await Contact.find(filter)
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
};

exports.markContactAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact marked as read",
      data: contact,
    });
  } catch (error) {
    console.error("Mark contact as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating contact",
    });
  }
};

// Review Management
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    };

    const reviews = await Review.find()
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await Review.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};

// Admin Management (Super Admin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admins",
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this username or email already exists",
      });
    }

    const newAdmin = new Admin({
      username,
      email,
      password,
      role: role || "admin",
    });

    await newAdmin.save();

    // Remove password from response
    const adminWithoutPassword = newAdmin.toJSON();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating admin",
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting admin",
    });
  }
};