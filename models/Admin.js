const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    firstName :{
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum :[
            "admin", "super-admin", "staff"
        ],
        default: "admin"
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date
    },
    loginAttempt: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
    }
},{
    timestamps: true
},)


// virtual for full name
adminSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`
})

// virtual for account lock status
adminSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUnitl > Date.now() )
})


// hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("passworrd")) return next()
    
    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash (this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

// compare password method
adminSchema.methods.comparePassword = async function(candidatesPassword){
    if (!this.password) return false
    return await bcrypt.compare(candidatesPassword, this.password)
}


// generate jwt 
adminSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            role: this.role
        },
        process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRE || "24h",
        }
    )
}


// Handle failed login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne(updates)
}

// Reset login attempts on successful login
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  })
}

module.exports = mongoose.model("Admin", adminSchema)
