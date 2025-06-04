const sendAppointmentConfirmation = (appointment) => {
  const formattedDate = appointment.appointmentDate.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Your email styles */
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>Appointment Confirmed</h2>
        <p>Dear ${appointment.firstName} ${appointment.lastName},</p>
        
        <div class="appointment-details">
          <h3>Appointment Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Department:</strong> ${appointment.department.replace('-', ' ')}</p>
          ${appointment.doctor ? `<p><strong>Doctor:</strong> ${appointment.doctor}</p>` : ''}
          <p><strong>Reason:</strong> ${appointment.reason}</p>
        </div>
        
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p><strong>Contact:</strong> +234-7081209617 | layolehospital@yahoo.com</p>
      </div>
    </body>
    </html>
  `;
};

const sendAppointmentNotification = (appointment) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Your email styles */
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>New Appointment Booking</h2>
        <p><strong>Patient:</strong> ${appointment.firstName} ${appointment.lastName}</p>
        <p><strong>Contact:</strong> ${appointment.email} | ${appointment.phone}</p>
        <p><strong>Date:</strong> ${appointment.appointmentDate.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
        <p><strong>Department:</strong> ${appointment.department.replace('-', ' ')}</p>
        <p><strong>Reason:</strong> ${appointment.reason}</p>
      </div>
    </body>
    </html>
  `;
};

// Add to your exports
module.exports = {
  // ... your existing exports
  sendAppointmentConfirmation,
  sendAppointmentNotification
};

// Contact form confirmation email
const sendContactConfirmation = (contactData) => {
  const formattedSubject = contactData.subject 
    ? contactData.subject.charAt(0).toUpperCase() + contactData.subject.slice(1).replace("-", " ")
    : 'General Inquiry';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .message-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Message Received</h1>
                <p>Layole Hospital</p>
            </div>
            
            <div class="content">
                <p>Dear ${contactData.firstName} ${contactData.lastName},</p>
                
                <p>Thank you for contacting Layole Hospital. We have received your message and will respond within 24-48 hours during business days.</p>
                
                <div class="message-details">
                    <h3>📝 Your Message</h3>
                    <p><strong>Subject:</strong> ${formattedSubject}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #2c5aa0;">${contactData.message}</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>⚠️ Medical Emergency?</strong></p>
                    <p>If this is a medical emergency, please call <strong>+234-7081209617</strong> immediately or visit our Emergency Department. Do not wait for an email response.</p>
                </div>
                
                <h3>📞 Contact Information</h3>
                <p><strong>Phone:</strong> +234-7081209617, +234-9067020311</p>
                <p><strong>Email:</strong> layolehospital@yahoo.com</p>
                <p><strong>Emergency:</strong> +234-7081209617</p>
                <p><strong>Address:</strong> Oyemekun Street, no 89 Off College Road, Ifako-Ijaiye, Lagos, Nigeria. P.O. Box 2818 Agege, Lagos.</p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Layole Hospital</p>
                <p>We appreciate your trust in our healthcare services</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Contact form notification for hospital staff
const sendContactNotification = (contactData) => {
  const formattedSubject = contactData.subject 
    ? contactData.subject.charAt(0).toUpperCase() + contactData.subject.slice(1).replace("-", " ")
    : 'General Inquiry';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .contact-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .priority { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .priority.high { background: #f8d7da; border: 1px solid #f5c6cb; }
            .priority.medium { background: #fff3cd; border: 1px solid #ffeaa7; }
            .priority.low { background: #d1ecf1; border: 1px solid #bee5eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 New Contact Message</h1>
                <p>Layole Hospital - Staff Notification</p>
            </div>
            
            <div class="content">
                <p>A new message has been received through the contact form.</p>
                
                <div class="contact-details">
                    <h3>👤 Contact Information</h3>
                    <p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName}</p>
                    <p><strong>Email:</strong> ${contactData.email}</p>
                    ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ""}
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="contact-details">
                    <h3>📝 Message Details</h3>
                    <p><strong>Subject:</strong> ${formattedSubject}</p>
                    
                    <div class="priority medium">
                        <p><strong>Priority:</strong> Medium (Auto-assigned)</p>
                    </div>
                    
                    <p><strong>Message:</strong></p>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #17a2b8; margin: 10px 0;">
                        ${contactData.message}
                    </div>
                </div>
                
                <p><strong>Action Required:</strong> Please review and respond to this inquiry within 24-48 hours.</p>
                
                <p><strong>Response Guidelines:</strong></p>
                <ul>
                    <li>General inquiries: Respond within 24 hours</li>
                    <li>Appointment requests: Respond within 4 hours</li>
                    <li>Billing questions: Forward to billing department</li>
                    <li>Medical records: Forward to medical records department</li>
                    <li>Feedback/Complaints: Forward to patient relations</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentNotification,
  sendContactConfirmation,
  sendContactNotification
};