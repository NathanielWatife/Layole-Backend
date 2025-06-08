const Appointment = require("../models/Appointment");

const getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [
            totalAppointments,
            pendingAppointments,
            todayAppointments,
            recentAppointments
        ] = await Promise.all([
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: "pending" }),
            Appointment.countDocuments({
                appointmentDate: { 
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }),
            Appointment.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("firstName lastName department appointmentDate status")
        ]);

        res.json({
            success: true,
            data: {
                totalAppointments,
                pendingAppointments,
                todayAppointments,
                recentAppointments
            }
        });
    } catch (error) {
        next(error);
    }
};

const getAppointmentAnalytics = async (req, res, next) => {
    try {
        const { period = "month" } = req.query;
        let dateRange = new Date();

        switch (period) {
            case "week":
                dateRange.setDate(dateRange.getDate() - 7);
                break;
            case "month":
                dateRange.setMonth(dateRange.getMonth() - 1);
                break;
            case "year":
                dateRange.setFullYear(dateRange.getFullYear() - 1);
                break;
            default:
                dateRange.setMonth(dateRange.getMonth() - 1);
        }

        const [appointmentsByDate, peakHours] = await Promise.all([
            Appointment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateRange }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Appointment.aggregate([
                {
                    $group: {
                        _id: "$appointmentTime",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                period,
                appointmentsByDate,
                peakHours
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAppointmentAnalytics
};