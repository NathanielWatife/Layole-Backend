const express = require("express")
const router = express.Router()
const {
  login,
  loginLimiter,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require("../controllers/authController")
const { protect, authorize } = require("../middleware/auth")
const {
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} = require("../middleware/validation")

// public routes
router.post("/login", loginLimiter, validateLogin, login)

// protected routes
router.use(protect)
router.get("/profile", getProfile);
router.put("/profile", validateProfileUpdate, updateProfile);
router.put("/change-password", validatePasswordChange, changePassword);
router.post("/logout", logout)


module.exports = router;