const { body, validationResult } = require("express-validator")

// Validation middleware
 const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

// Login validation rules
 const validateLogin = [
  body("username").trim().isLength({ min: 1 }).withMessage("Username or email is required"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
  handleValidationErrors,
]

// Profile update validation rules
 const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  handleValidationErrors,
]

// Password change validation rules
 const validatePasswordChange = [
  body("currentPassword").isLength({ min: 1 }).withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
]

// Appointment validation rules
 const validateAppointment = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters"),

  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be less than 50 characters"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

  body("phone")
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("gender")
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Please select a valid gender option"),

  body("department")
    .isIn([
      "paediatric",
      "orthopedic",
      "obstetrics",
      "consultants",
      "general-surgery",
      "internal-medicine",
      "emergency",
    ])
    .withMessage("Please select a valid department"),

  body("appointmentDate")
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (value < today) {
        throw new Error("Appointment date must be today or in the future")
      }
      return true
    }),

  body("appointmentTime")
    .isIn(["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"])
    .withMessage("Please select a valid appointment time"),

  body("reason")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason for visit must be between 10 and 500 characters"),

  body("address").optional().trim().isLength({ max: 200 }).withMessage("Address must be less than 200 characters"),

  body("insurance")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Insurance provider name must be less than 100 characters"),

  handleValidationErrors,
]

// Contact validation rules
const validateContact = [
  // First Name validation
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  // Last Name validation
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

  // Subject validation
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isIn(['general-inquiry', 'appointment', 'billing', 'medical-records', 'feedback', 'other'])
    .withMessage('Invalid subject'),

  // Message validation
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),

  // Phone validation (optional)
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone().withMessage('Invalid phone number'),

  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateAppointment,
  validateContact
}