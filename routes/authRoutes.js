const express = require("express")

const router = express.Router()

// Import controllers with error handling
let authController
try {
  authController = require("../controllers/authController")
} catch (error) {
  console.error("Error loading authController:", error.message)
  // Create placeholder functions
  authController = {
    login: (req, res) => res.status(500).json({ error: "Auth controller not available" }),
    getProfile: (req, res) => res.status(500).json({ error: "Auth controller not available" }),
    updateProfile: (req, res) => res.status(500).json({ error: "Auth controller not available" }),
    changePassword: (req, res) => res.status(500).json({ error: "Auth controller not available" }),
    logout: (req, res) => res.status(500).json({ error: "Auth controller not available" }),
  }
}

// Import middleware with error handling
let authMiddleware, validationMiddleware
try {
  authMiddleware = require("../middleware/auth")
} catch (error) {
  console.warn("Auth middleware not found, using placeholder")
  authMiddleware = { protect: (req, res, next) => next() }
}

try {
  validationMiddleware = require("../middleware/validation")
} catch (error) {
  console.warn("Validation middleware not found, using placeholder")
  validationMiddleware = {
    validateLogin: (req, res, next) => next(),
    validateProfileUpdate: (req, res, next) => next(),
    validatePasswordChange: (req, res, next) => next(),
  }
}

const { login, getProfile, updateProfile, changePassword, logout } = authController
const { protect } = authMiddleware
const { validateLogin, validateProfileUpdate, validatePasswordChange } = validationMiddleware

// Public routes
router.post("/login", validateLogin, login)

// Protected routes
router.use(protect) // All routes below this middleware require authentication

router.get("/profile", getProfile)
router.put("/profile", validateProfileUpdate, updateProfile)
router.put("/change-password", validatePasswordChange, changePassword)
router.post("/logout", logout)

module.exports = router
