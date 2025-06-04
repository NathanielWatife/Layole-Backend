const mongoose = require("mongoose")
require("dotenv").config()

const connectDB = require("../config/database")
const Appointment = require("../models/Appointment")
const Contact = require("../models/Contact")

const seedData = async () => {
  try {
    await connectDB()

    // Clear existing data
    await Appointment.deleteMany({})
    await Contact.deleteMany({})

    // Sample appointments
    const appointments = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+1234567890",
        dateOfBirth: new Date("1990-05-15"),
        gender: "male",
        address: "123 Main St, City, State 12345",
        department: "general-surgery",
        doctor: "Dr. Sarah Johnson",
        appointmentDate: new Date("2024-02-15"),
        appointmentTime: "10:00",
        reason: "Regular checkup and consultation",
        insurance: "Blue Cross Blue Shield",
        status: "confirmed",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@email.com",
        phone: "+1987654321",
        dateOfBirth: new Date("1985-08-22"),
        gender: "female",
        department: "paediatric",
        appointmentDate: new Date("2024-02-16"),
        appointmentTime: "14:00",
        reason: "Child vaccination appointment",
        status: "pending",
      },
    ]

    // Sample contacts
    const contacts = [
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@email.com",
        phone: "+1555123456",
        subject: "general-inquiry",
        message: "I would like to know more about your cardiology services and available specialists.",
        status: "new",
        priority: "medium",
      },
      {
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob.wilson@email.com",
        subject: "billing",
        message: "I have a question about my recent bill. Could someone from billing please contact me?",
        status: "in-progress",
        priority: "high",
      },
    ]

    // Insert sample data
    await Appointment.insertMany(appointments)
    await Contact.insertMany(contacts)

    console.log("✅ Database seeded successfully!")
    console.log(`📅 Created ${appointments.length} sample appointments`)
    console.log(`📧 Created ${contacts.length} sample contacts`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedData()
