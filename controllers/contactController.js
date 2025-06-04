const { sendContactConfirmation, sendContactNotification } = require("../utils/emailTemplates");
const { sendEmail } = require("../utils/sendEmail");
const { validateContact } = require("../middleware/validation");

const createContact = [
  validateContact,
  async (req, res, next) => {
    try {
      const contactData = req.body;

      // Send confirmation email to sender
      await sendEmail(
        contactData.email,
        "Message Received - Layole Hospital",
        sendContactConfirmation(contactData),
        "Thank you for contacting us. We'll respond soon."
      );

      // Send notification to hospital
      await sendEmail(
        process.env.HOSPITAL_EMAIL || "layolehospital@yahoo.com",
        `New Contact: ${contactData.subject}`,
        sendContactNotification(contactData),
        `New message from ${contactData.firstName} ${contactData.lastName}`
      );

      res.status(200).json({
        success: true,
        message: "Message sent successfully"
      });

    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to send message. Please try again later."
      });
    }
  }
];

module.exports = { createContact };