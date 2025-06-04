const Appointment = require("../models/Appointment")
const Contact = require("../models/Contact")

// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Parallel queries for better performance
    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments,
      thisWeekAppointments,
      thisMonthAppointments,
      totalContacts,
      newContacts,
      appointmentsByDepartment,
      appointmentsByStatus,
      appointmentsTrend,
      contactsBySubject,
      recentAppointments,
      recentContacts,
    ] = await Promise.all([
      // Appointment counts
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),

      // Time-based appointment counts
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: thisWeekStart },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: thisMonthStart },
      }),

      // Contact counts
      Contact.countDocuments(),
      Contact.countDocuments({ status: "new" }),

      // Aggregations
      Appointment.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),

      Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),

      // Appointments trend for last 7 days
      Appointment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Contact.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),

      // Recent data
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName department appointmentDate appointmentTime status"),

      Contact.find().sort({ createdAt: -1 }).limit(5).select("firstName lastName subject status createdAt"),
    ])

    res.json({
      success: true,
      data: {
        overview: {
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          cancelledAppointments,
          todayAppointments,
          thisWeekAppointments,
          thisMonthAppointments,
          totalContacts,
          newContacts,
        },
        charts: {
          appointmentsByDepartment,
          appointmentsByStatus,
          appointmentsTrend,
          contactsBySubject,
        },
        recent: {
          appointments: recentAppointments,
          contacts: recentContacts,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}


// @route   GET /api/dashboard/appointments-analytics
// @access  Private (Admin)
const getAppointmentAnalytics = async (req, res, next) => {
  try {
    const { period = "month" } = req.query

    let dateRange
    const now = new Date()

    switch (period) {
      case "week":
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        dateRange = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const analytics = await Promise.all([
      // Appointments by date
      Appointment.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Peak hours analysis
      Appointment.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange },
          },
        },
        {
          $group: {
            _id: "$appointmentTime",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Department performance
      Appointment.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange },
          },
        },
        {
          $group: {
            _id: "$department",
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        {
          $addFields: {
            completionRate: {
              $multiply: [{ $divide: ["$completed", "$total"] }, 100],
            },
            cancellationRate: {
              $multiply: [{ $divide: ["$cancelled", "$total"] }, 100],
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ])

    res.json({
      success: true,
      data: {
        period,
        dateRange,
        appointmentsByDate: analytics[0],
        peakHours: analytics[1],
        departmentPerformance: analytics[2],
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDashboardStats,
  getAppointmentAnalytics,
}
