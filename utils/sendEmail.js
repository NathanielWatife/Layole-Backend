const createTransporter = require("../config/email");

const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Layole Hospital" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: html || text, // fallback to text if html is empty
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : '') // create text version if needed
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendEmail };