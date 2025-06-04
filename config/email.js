const nodemailer = require("nodemailer");

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // for self-signed certificates
    }
  });

  // Verify email configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log("Email configuration error:", error);
    } else {
      console.log("Email server is ready to send messages");
    }
  });

  return transporter;
};

module.exports = createTransporter;