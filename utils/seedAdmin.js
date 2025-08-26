const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const dotenv = require("dotenv");

dotenv.config(); 

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI; 
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: process.env.SUPERADMIN_USERNAME },
        { email: process.env.SUPERADMIN_EMAIL }
      ]
    });

    if (existingAdmin) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      username: process.env.SUPERADMIN_USERNAME,
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD,
      role: process.env.SUPERADMIN_ROLE,
    });

    await superAdmin.save();
    console.log(`Super admin created successfully:`);
    console.log("Username");
    console.log("Email");
    console.log("Password");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();