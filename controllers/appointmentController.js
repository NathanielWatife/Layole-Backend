const Appointment = require("../models/Appointment")
const { sendAppointmentConfirmation, sendAppointmentNotification } = require("../utils/emailTemplates")
const { sendEmail } = require("../utils/sendEmail")


const createAppointment = async (req, res, next) => {
  try {
    const appointmentData = req.body;

    // Convert date string to Date object
    appointmentData.appointmentDate = new Date(appointmentData.appointmentDate);

    // Check for existing appointment
    const existingAppointment = await Appointment.findOne({
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: "This time slot is already booked. Please choose a different time."
      });
    }

    // Create new appointment
    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Send emails (don't block response if email fails)
    try {
      // Patient confirmation
      await sendEmail(
        appointment.email,
        "Appointment Confirmation - Layole Hospital",
        sendAppointmentConfirmation(appointment),
        `Your appointment is confirmed for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.appointmentTime}`
      );

      // Hospital notification
      await sendEmail(
        process.env.HOSPITAL_EMAIL || "layolehospital@yahoo.com",
        "New Appointment Booking",
        sendAppointmentNotification(appointment),
        `New appointment: ${appointment.firstName} ${appointment.lastName}`
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointmentId: appointment._id,
        date: appointment.appointmentDate.toISOString().split('T')[0],
        time: appointment.appointmentTime,
        department: appointment.department
      }
    });

  } catch (error) {
    next(error);
  }
};



const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, department, date, search } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (department) query.department = department
    if (date) {
      const searchDate = new Date(date)
      const nextDay = new Date(searchDate)
      nextDay.setDate(nextDay.getDate() + 1)
      query.appointmentDate = {
        $gte: searchDate,
        $lt: nextDay,
      }
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v")

    const total = await Appointment.countDocuments(query)

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAppointments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}


const getAppointment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            error: "Invalid"
        });
    }
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      })
    }

    res.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    next(error)
  }
}


const updateAppointment = async (req, res, next) => {
  try {
    const { status, notes } = req.body

    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      })
    }

    appointment.status = status || appointment.status
    appointment.notes = notes || appointment.notes

    await appointment.save()

    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    })
  } catch (error) {
    next(error)
  }
}


const deleteAppointment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            error: "Invalid"
        });
    }
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      })
    }

    await appointment.deleteOne()

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}


module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment
}