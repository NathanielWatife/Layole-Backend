const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const connectDB = require("./config/db")
const appointmentRoutes = require("./routes/appointmentRoutes")
const contactRoutes = require("./routes/contactRoutes")
const authRoutes = require("./routes/authRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const utilityRoutes = require("./routes/utilityRoutes")
const errorHandler = require("./middleware/errorHandler")
const app = express()
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000

// Connect to database
connectDB()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || [
      "http://localhost:8080",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:8080",
      "http://localhost:3000"
    ],
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  trustProxy: true
})
app.use("/api/", limiter)

// Routes
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Hospital Backend API",
    endpoints: {
      auth: "/api/auth",
      dashboard: "/api/dashboard",
      appointments: "/api/appointments",
      contact: "/api/contact",
      utility: "/api"
    },
    healthCheck: "/api/health"
  });
});
app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api", utilityRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Hospital backend server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app
