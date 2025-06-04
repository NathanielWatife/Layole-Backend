// Appointment confirmation email template
const sendAppointmentConfirmation = (appointment) => {
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
                <h1>🏥 MediCare Hospital</h1>
                <h2>Appointment Confirmation</h2>
            </div>
            
            <div class="content">
                <p>Dear ${appointment.firstName} ${appointment.lastName},</p>
                
                <p>Thank you for booking an appointment with MediCare Hospital. Your appointment has been successfully scheduled.</p>
                
                <div class="appointment-details">
                    <h3>📅 Appointment Details</h3>
                    <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</p>
                    <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                    <p><strong>Department:</strong> ${appointment.department.charAt(0).toUpperCase() + appointment.department.slice(1).replace("-", " ")}</p>
                    ${appointment.doctor ? `<p><strong>Doctor:</strong> ${appointment.doctor}</p>` : ""}
                    <p><strong>Reason for Visit:</strong> ${appointment.reason}</p>
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
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Email:</strong> appointments@medicarehospital.com</p>
                <p><strong>Address:</strong> 123 Healthcare Avenue, Medical City, MC 12345</p>
                
                <p style="margin-top: 30px;">
                    <a href="https://maps.google.com/?q=123+Healthcare+Avenue,+Medical+City,+MC+12345" class="btn">Get Directions</a>
                </p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing MediCare Hospital</p>
                <p>Your health is our priority</p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Appointment notification email for hospital staff
const sendAppointmentNotification = (appointment) => {
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
                <p>MediCare Hospital - Staff Notification</p>
            </div>
            
            <div class="content">
                <p class="urgent">A new appointment has been booked and requires attention.</p>
                
                <div class="patient-info">
                    <h3>👤 Patient Information</h3>
                    <p><strong>Name:</strong> ${appointment.firstName} ${appointment.lastName}</p>
                    <p><strong>Email:</strong> ${appointment.email}</p>
                    <p><strong>Phone:</strong> ${appointment.phone}</p>
                    <p><strong>Date of Birth:</strong> ${new Date(appointment.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Gender:</strong> ${appointment.gender}</p>
                    ${appointment.address ? `<p><strong>Address:</strong> ${appointment.address}</p>` : ""}
                    ${appointment.insurance ? `<p><strong>Insurance:</strong> ${appointment.insurance}</p>` : ""}
                </div>
                
                <div class="appointment-info">
                    <h3>📅 Appointment Information</h3>
                    <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</p>
                    <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                    <p><strong>Department:</strong> ${appointment.department.charAt(0).toUpperCase() + appointment.department.slice(1).replace("-", " ")}</p>
                    ${appointment.doctor ? `<p><strong>Preferred Doctor:</strong> ${appointment.doctor}</p>` : ""}
                    <p><strong>Reason for Visit:</strong> ${appointment.reason}</p>
                    <p><strong>Booking Time:</strong> ${new Date(appointment.createdAt).toLocaleString()}</p>
                </div>
                
                <p><strong>Action Required:</strong> Please review and confirm this appointment in the hospital management system.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Contact form confirmation email
const sendContactConfirmation = (contact) => {
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
                <p>MediCare Hospital</p>
            </div>
            
            <div class="content">
                <p>Dear ${contact.firstName} ${contact.lastName},</p>
                
                <p>Thank you for contacting MediCare Hospital. We have received your message and will respond within 24-48 hours during business days.</p>
                
                <div class="message-details">
                    <h3>📝 Your Message</h3>
                    <p><strong>Subject:</strong> ${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1).replace("-", " ")}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #2c5aa0;">${contact.message}</p>
                    <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>⚠️ Medical Emergency?</strong></p>
                    <p>If this is a medical emergency, please call <strong>911</strong> immediately or visit our Emergency Department. Do not wait for an email response.</p>
                </div>
                
                <h3>📞 Contact Information</h3>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Email:</strong> info@medicarehospital.com</p>
                <p><strong>Emergency:</strong> 911</p>
                <p><strong>Address:</strong> 123 Healthcare Avenue, Medical City, MC 12345</p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing MediCare Hospital</p>
                <p>We appreciate your trust in our healthcare services</p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Contact form notification for hospital staff
const sendContactNotification = (contact) => {
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
                <p>MediCare Hospital - Staff Notification</p>
            </div>
            
            <div class="content">
                <p>A new message has been received through the contact form.</p>
                
                <div class="contact-details">
                    <h3>👤 Contact Information</h3>
                    <p><strong>Name:</strong> ${contact.firstName} ${contact.lastName}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ""}
                    <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
                </div>
                
                <div class="contact-details">
                    <h3>📝 Message Details</h3>
                    <p><strong>Subject:</strong> ${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1).replace("-", " ")}</p>
                    
                    <div class="priority medium">
                        <p><strong>Priority:</strong> Medium (Auto-assigned)</p>
                    </div>
                    
                    <p><strong>Message:</strong></p>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #17a2b8; margin: 10px 0;">
                        ${contact.message}
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
  `
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentNotification,
  sendContactConfirmation,
  sendContactNotification,
}
