const Contact = require("../models/Contact")
const { sendContactConfirmation, sendContactNotification } = require("../utils/emailTemplates")
const { sendEmail } = require("../utils/sendEmail")
const { validateContact } = require("./validation");


// @route   POST /api/contact
// @access  Public
const createContact = [
  validateContact, // Add validation middleware
  async (req, res, next) => {
    try {
      const contactData = req.body;

      // Create new contact message
      const contact = new Contact(contactData);
      await contact.save();

      // Send confirmation email to sender
      const confirmationEmailHtml = sendContactConfirmation(contact);
      await sendEmail(
        contact.email,
        "Message Received - MediCare Hospital",
        confirmationEmailHtml,
        "Thank you for contacting MediCare Hospital. We will respond soon.",
      );

      // Send notification email to hospital
      const notificationEmailHtml = sendContactNotification(contact);
      await sendEmail(
        process.env.HOSPITAL_EMAIL || "info@medicarehospital.com",
        "New Contact Form Submission",
        notificationEmailHtml,
        `New contact: ${contact.fullName} - ${contact.subject}`,
      );

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: {
          contactId: contact._id,
          subject: contact.subject,
        },
      });
    } catch (error) {
      next(error);
    }
  }
];


// @route   GET /api/contact
// @access  Private (Admin)
const getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, subject, search } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (priority) query.priority = priority
    if (subject) query.subject = subject
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v")

    const total = await Contact.countDocuments(query)

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalContacts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}


// @route   GET /api/contact/:id
// @access  Private (Admin)
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact message not found",
      })
    }

    res.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    next(error)
  }
}


// @route   PUT /api/contact/:id
// @access  Private (Admin)
const updateContact = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, response } = req.body

    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact message not found",
      })
    }

    contact.status = status || contact.status
    contact.priority = priority || contact.priority
    contact.assignedTo = assignedTo || contact.assignedTo

    if (response) {
      contact.response = response
      contact.responseDate = new Date()
    }

    await contact.save()

    res.json({
      success: true,
      message: "Contact message updated successfully",
      data: contact,
    })
  } catch (error) {
    next(error)
  }
}


// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact message not found",
      })
    }

    await contact.deleteOne()

    res.json({
      success: true,
      message: "Contact message deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @route   GET /api/contact/stats
// @access  Private (Admin)
const getContactStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Total contacts
      Contact.countDocuments(),
      // New contacts
      Contact.countDocuments({ status: "new" }),
      // In progress contacts
      Contact.countDocuments({ status: "in-progress" }),
      // Resolved contacts
      Contact.countDocuments({ status: "resolved" }),
      // Contacts by subject
      Contact.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      // Contacts by priority
      Contact.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ])

    res.json({
      success: true,
      data: {
        total: stats[0],
        new: stats[1],
        inProgress: stats[2],
        resolved: stats[3],
        bySubject: stats[4],
        byPriority: stats[5],
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
}
