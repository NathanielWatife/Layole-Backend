const express = require("express")
const router = express.Router()

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// @desc    Get hospital location data
// @route   GET /api/directions
// @access  Public
router.get("/directions", (req, res) => {
  const hospitalLocation = {
    name: "MediCare Hospital",
    address: "123 Healthcare Avenue, Medical City, MC 12345",
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
    phone: "+1 (555) 123-4567",
    emergency: "911",
    hours: {
      weekdays: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 4:00 PM",
      sunday: "Emergency Only",
      emergency: "24/7",
    },
    parking: {
      available: true,
      spaces: 200,
      cost: "Free",
    },
    publicTransport: ["Bus routes 15, 23, and 45", "Metro Station: Medical Center (0.3 miles)"],
  }

  res.json({
    success: true,
    data: hospitalLocation,
  })
})

// @desc    Get available appointment slots
// @route   GET /api/available-slots
// @access  Public
router.get("/available-slots", async (req, res) => {
  try {
    const { date, department } = req.query

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date parameter is required",
      })
    }

    const Appointment = require("../models/Appointment")

    // Get booked slots for the date
    const bookedSlots = await Appointment.find({
      appointmentDate: new Date(date),
      department: department || { $exists: true },
      status: { $in: ["pending", "confirmed"] },
    }).select("appointmentTime")

    const bookedTimes = bookedSlots.map((slot) => slot.appointmentTime)

    // All available time slots
    const allSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

    // Filter out booked slots
    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot))

    res.json({
      success: true,
      data: {
        date,
        department: department || "all",
        availableSlots,
        bookedSlots: bookedTimes,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch available slots",
    })
  }
})

module.exports = router
