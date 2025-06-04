const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "paediatric",
        "orthopedic",
        "obstetrics",
        "consultants",
        "general-surgery",
        "internal-medicine",
        "emergency",
      ],
    },
    doctor: {
      type: String,
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
      validate: {
        validator: (value) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return value >= today
        },
        message: "Appointment date must be today or in the future",
      },
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
      enum: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],
    },
    reason: {
      type: String,
      required: [true, "Reason for visit is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    insurance: {
      type: String,
      trim: true,
      maxlength: [100, "Insurance provider name cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 })
appointmentSchema.index({ email: 1 })
appointmentSchema.index({ status: 1 })

// Virtual for full name
appointmentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function () {
  const appointmentDateTime = new Date(this.appointmentDate)
  const [hours, minutes] = this.appointmentTime.split(":")
  appointmentDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))

  return appointmentDateTime > new Date()
}

module.exports = mongoose.model("Appointment", appointmentSchema)
