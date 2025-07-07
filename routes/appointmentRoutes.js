const express = require("express")
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController")

const router = express.Router()

// Import middleware with error handling
let validateAppointment, appointmentLimiter

try {
  const validation = require("../middleware/validation")
  validateAppointment = validation.validateAppointment
} catch (error) {
  console.warn("Validation middleware not found, using placeholder")
  validateAppointment = (req, res, next) => next()
}

try {
  const rateLimiter = require("../middleware/rateLimiter")
  appointmentLimiter = rateLimiter.appointmentLimiter
} catch (error) {
  console.warn("Rate limiter middleware not found, using placeholder")
  appointmentLimiter = (req, res, next) => next()
}

// Public routes
router.post("/", appointmentLimiter, validateAppointment, createAppointment)

// Admin routes (would need authentication middleware in production)
router.get("/", getAppointments)
router.get("/:id", getAppointment)
router.put("/:id", updateAppointment)
router.delete("/:id", deleteAppointment)

module.exports = router
