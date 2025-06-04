// emailTemplates.js

// Appointment confirmation email template
const sendAppointmentConfirmation = (appointmentData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .appointment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
            .btn { background: #2c5aa0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Layole Hospital</h1>
                <h2>Appointment Confirmation</h2>
            </div>
            
            <div class="content">
                <p>Dear ${appointmentData.firstName} ${appointmentData.lastName},</p>
                
                <p>Thank you for booking an appointment with Layole Hospital. Your appointment has been successfully scheduled.</p>
                
                <div class="appointment-details">
                    <h3>📅 Appointment Details</h3>
                    <p><strong>Date:</strong> ${new Date(appointmentData.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</p>
                    <p><strong>Time:</strong> ${appointmentData.appointmentTime}</p>
                    <p><strong>Department:</strong> ${appointmentData.department.charAt(0).toUpperCase() + appointmentData.department.slice(1).replace("-", " ")}</p>
                    ${appointmentData.doctor ? `<p><strong>Doctor:</strong> ${appointmentData.doctor}</p>` : ""}
                    <p><strong>Reason for Visit:</strong> ${appointmentData.reason}</p>
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
                </div>
                
                <h3>📋 Important Information</h3>
                <ul>
                    <li>Please arrive 15 minutes before your scheduled appointment time</li>
                    <li>Bring a valid ID and insurance card (if applicable)</li>
                    <li>Bring a list of current medications</li>
                    <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance</li>
                </ul>
                
                <h3>📞 Contact Information</h3>
                <p><strong>Phone:</strong> +234-7081209617, +234-9067020311</p>
                <p><strong>Email:</strong> layolehospital@yahoo.com</p>
                <p><strong>Address:</strong> Oyemekun Street, no 89 Off College Road, Ifako-Ijaiye, Lagos, Nigeria. P.O. Box 2818 Agege, Lagos.</p>
                
                <p style="margin-top: 30px;">
                    <a href="https://maps.google.com/?q=Oyemekun+Street,+no+89+Off+College+Road,+Ifako-Ijaiye,+Lagos,+Nigeria" class="btn">Get Directions</a>
                </p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Layole Hospital</p>
                <p>Your health is our priority</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Appointment notification email for hospital staff
const sendAppointmentNotification = (appointmentData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment Booking</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .patient-info, .appointment-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .urgent { color: #dc3545; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 New Appointment Alert</h1>
                <p>Layole Hospital - Staff Notification</p>
            </div>
            
            <div class="content">
                <p class="urgent">A new appointment has been booked and requires attention.</p>
                
                <div class="patient-info">
                    <h3>👤 Patient Information</h3>
                    <p><strong>Name:</strong> ${appointmentData.firstName} ${appointmentData.lastName}</p>
                    <p><strong>Email:</strong> ${appointmentData.email}</p>
                    <p><strong>Phone:</strong> ${appointmentData.phone}</p>
                    ${appointmentData.dateOfBirth ? `<p><strong>Date of Birth:</strong> ${new Date(appointmentData.dateOfBirth).toLocaleDateString()}</p>` : ""}
                    ${appointmentData.gender ? `<p><strong>Gender:</strong> ${appointmentData.gender}</p>` : ""}
                    ${appointmentData.address ? `<p><strong>Address:</strong> ${appointmentData.address}</p>` : ""}
                    ${appointmentData.insurance ? `<p><strong>Insurance:</strong> ${appointmentData.insurance}</p>` : ""}
                </div>
                
                <div class="appointment-info">
                    <h3>📅 Appointment Information</h3>
                    <p><strong>Date:</strong> ${new Date(appointmentData.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</p>
                    <p><strong>Time:</strong> ${appointmentData.appointmentTime}</p>
                    <p><strong>Department:</strong> ${appointmentData.department.charAt(0).toUpperCase() + appointmentData.department.slice(1).replace("-", " ")}</p>
                    ${appointmentData.doctor ? `<p><strong>Preferred Doctor:</strong> ${appointmentData.doctor}</p>` : ""}
                    <p><strong>Reason for Visit:</strong> ${appointmentData.reason}</p>
                    <p><strong>Booking Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <p><strong>Action Required:</strong> Please review and confirm this appointment in the hospital management system.</p>
            </div>
        </div>
    </body>
    </html>
  `;
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