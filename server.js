const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
require("dotenv").config()

const connectDB = require("./config/db")
const appointmentRoutes = require("./routes/appointmentRoutes")
const contactRoutes = require("./routes/contactRoutes")
const authRoutes = require("./routes/authRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const errorHandler = require("./middleware/errorHandler")


const app = express()
const PORT = process.env.PORT || 3000
// connect to databse
connectDB()

// middleware
app.use(helmet())
app.use(
    cors({
        origins: [
            process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
)


app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// routes
app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/contact", contactRoutes)


// error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" })
})

// server
app.listen(PORT, () => {
    console.log(`Layole backend server running on port ${PORT}`)
})

module.exports = app