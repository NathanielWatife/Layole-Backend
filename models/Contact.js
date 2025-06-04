const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: ["general-inquiry", "appointment", "billing", "medical-records", "feedback", "other"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    response: {
      type: String,
      trim: true,
    },
    responseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
contactSchema.index({ status: 1 })
contactSchema.index({ priority: 1 })
contactSchema.index({ createdAt: -1 })

// Virtual for full name
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Method to mark as resolved
contactSchema.methods.markResolved = function (response, assignedTo) {
  this.status = "resolved"
  this.response = response
  this.responseDate = new Date()
  this.assignedTo = assignedTo
  return this.save()
}

module.exports = mongoose.model("Contact", contactSchema)
