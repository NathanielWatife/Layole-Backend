const mongoose = require("mongoose")
const readline = require("readline")
require("dotenv").config()

const connectDB = require("../config/database")
const Admin = require("../models/Admin")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

const createAdmin = async () => {
  try {
    await connectDB()

    console.log("🔧 Creating Admin Account")
    console.log("========================")

    const username = await question("Username: ")
    const email = await question("Email: ")
    const firstName = await question("First Name: ")
    const lastName = await question("Last Name: ")
    const password = await question("Password: ")
    const role = (await question("Role (admin/super-admin/staff) [admin]: ")) || "admin"

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    })

    if (existingAdmin) {
      console.log("❌ Admin with this username or email already exists")
      process.exit(1)
    }

    // Create admin
    const admin = new Admin({
      username,
      email,
      firstName,
      lastName,
      password,
      role,
    })

    await admin.save()

    console.log("✅ Admin account created successfully!")
    console.log(`👤 Username: ${username}`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Role: ${role}`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error creating admin:", error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

createAdmin()
