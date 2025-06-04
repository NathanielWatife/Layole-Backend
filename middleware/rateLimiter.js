const rateLimit = require("express-rate-limit")

// Appointment booking rate limiter
const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 appointment requests per hour
  message: {
    success: false,
    error: "Too many appointment requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact requests per 15 minutes
  message: {
    success: false,
    error: "Too many contact requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  appointmentLimiter,
  contactLimiter,
  generalLimiter,
}
