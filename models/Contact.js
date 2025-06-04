const contactSchema = (
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

module.exports = model("Contact", contactSchema)