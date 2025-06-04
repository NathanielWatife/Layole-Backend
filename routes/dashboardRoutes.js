const express = require("express")
const { getDashboardStats, getAppointmentAnalytics } = require("../controllers/dashboardController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// All dashboard routes require admin authentication
router.use(protect)
router.use(authorize("admin", "super-admin", "staff"))

router.get("/stats", getDashboardStats)
router.get("/appointments-analytics", getAppointmentAnalytics)

module.exports = router
