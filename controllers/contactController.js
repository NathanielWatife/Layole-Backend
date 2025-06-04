const { sendContactConfirmation, sendContactNotification } = require("../utils/emailTemplates")
const { sendEmail } = require("../utils/sendEmail")
const { validateContact } = require("../middleware/validation");

//  POST /api/contact
//  Public
const createContact = [
  validateContact, 
  async (req, res, next) => {
    try {
      const contactData = req.body;

      // Send confirmation email to sender
      const confirmationEmailHtml = sendContactConfirmation(contactData);
      await sendEmail(
        contactData.email,
        "Message Received - Layole Hospital",
        confirmationEmailHtml,
        "Thank you for contacting Layole Hospital. We will respond soon.",
      );

      // Send notification email to hospital
      const notificationEmailHtml = sendContactNotification(contactData);
      await sendEmail(
        process.env.HOSPITAL_EMAIL,
        "New Contact Form Submission",
        notificationEmailHtml,
        `New contact: ${contactData.firstName} ${contactData.lastName} - ${contactData.subject}`,
      );

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }
];


module.exports = {
  createContact
}