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
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  handleValidationErrors
];



module.exports = {
  validateAppointment,
  validateContact,
}