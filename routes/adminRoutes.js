const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const blogController = require("../controllers/blogController");
const adminAuth = require("../middleware/adminAuth");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");

// Public routes
router.post("/login", adminController.login);

// Protected routes (all routes below require authentication)
router.use(adminAuth);

// Profile routes
router.get("/profile", adminController.getProfile);
router.put("/change-password", adminController.changePassword);

// Dashboard routes
router.get("/dashboard", adminController.getDashboardStats);

// Blog management routes
router.get("/blogs", blogController.getAllBlogs);
router.get("/blogs/:id", blogController.getBlog);
router.post(
  "/blogs",
  requireRole(["superadmin", "admin", "editor"]),
  upload.single("featuredImage"),
  blogController.createBlog
);
router.put(
  "/blogs/:id",
  requireRole(["superadmin", "admin", "editor"]),
  upload.single("featuredImage"),
  blogController.updateBlog
);
router.delete(
  "/blogs/:id",
  requireRole(["superadmin", "admin"]),
  blogController.deleteBlog
);

// Appointment management routes
router.get("/appointments", adminController.getAllAppointments);
router.put("/appointments/:id", adminController.updateAppointment);

// Contact management routes
router.get("/contacts", adminController.getAllContacts);
router.put("/contacts/:id/read", adminController.markContactAsRead);

// Review management routes
router.get("/reviews", adminController.getAllReviews);
router.delete("/reviews/:id", adminController.deleteReview);

// Admin management routes (Super Admin only)
router.get(
  "/admins",
  requireRole(["superadmin"]),
  adminController.getAllAdmins
);
router.post(
  "/admins",
  requireRole(["superadmin"]),
  adminController.createAdmin
);
router.delete(
  "/admins/:id",
  requireRole(["superadmin"]),
  adminController.deleteAdmin
);

module.exports = router;