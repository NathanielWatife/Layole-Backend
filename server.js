const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
require("dotenv").config()

const connectDB = require("./config/db")
const appointmentRoutes = require("./routes/appointmentRoutes")
const contactRoutes = require("./routes/contactRoutes")
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
    ],
    credentials: true
  })
);

// loggin in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// body parsers
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


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    database: "connected" // You could add DB ping check here
  });
});


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

app.use("/api/appointments", appointmentRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api", utilityRoutes)


// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Resource not found",
    endpoint: req.originalUrl
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Hospital backend server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app
