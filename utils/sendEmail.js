const createTransporter = require("../config/email")

const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"MediCare Hospital" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

module.exports = { sendEmail }
