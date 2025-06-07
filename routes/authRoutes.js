const express = require("express")
const router = express.Router()
const {
  login,
  loginLimiter,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken
} = require("../controllers/authController")
const { protect } = require("../middleware/auth")
const {
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateRefreshToken
} = require("../middleware/validation")

// rate limiter
const generalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later"
})


// apply general rate limiting for auth routes
router.use(generalLimiter)

// public routes
router.post("/login", loginLimiter, validateLogin, login)
router.post("/refresh-token", validateRefreshToken, refreshToken)


// protected routes 
router.use(protect);

// sensitive routes
const sensitiveRoutes = express.Router()
sensitiveRoutes.use((req, res, next) => {
  // check if authentication was recent
  if (req.admin.lastAuth && Date.now() - new Date(req.admin.lastAuth). getTime() > 15 * 60 * 1000) {
    return res.status(401).json({
      success: false,
      error: "Reuathentication required",
      code: "REAUTH_REQUIRED"
    })
  }
  next()
})


// profile management
router.get("/profile", getProfile)
router.put("/profile", validateProfileUpdate, updateProfile)

// password 
sensitiveRoutes.put("/change-password", validatePasswordChange, changePassword);
router.use(sensitiveRoutes);

// Session management
router.post("/logout", logout);
router.get("/sessions", listSessions);
router.delete("/sessions/:sessionId", revokeSession);

// Admin-specific routes
const adminRoutes = express.Router();
adminRoutes.use(authorize("admin", "super-admin"));

adminRoutes.post("/invite", validateAdminInvite, inviteAdmin);
adminRoutes.put("/users/:id/status", validateUserStatus, updateUserStatus);

router.use("/admin", adminRoutes);

// Error handling middleware specifically for auth routes
router.use((err, req, res, next) => {
  console.error("Auth route error:", err);
  
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.errors
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }

  res.status(500).json({
    success: false,
    error: "Authentication service unavailable"
  });
});

module.exports = router;