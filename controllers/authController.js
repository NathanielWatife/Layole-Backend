const Admin = require("../models/Admin")
const { sendEmail } = require("../utils/sendEmail")


// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username and password",
      })
    }

    // Find admin and include password field
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password")

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        error: "Account is temporarily locked due to too many failed login attempts",
      })
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
      })
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password)

    if (!isPasswordValid) {
      await admin.incLoginAttempts()
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts()

    // Generate token
    const token = admin.generateToken()

    // Remove password from response
    admin.password = undefined

    res.json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}


// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id)

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      })
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body

    const admin = await Admin.findById(req.admin.id)

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      })
    }

    // Update fields
    admin.firstName = firstName || admin.firstName
    admin.lastName = lastName || admin.lastName
    admin.email = email || admin.email

    await admin.save()

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}


// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current password and new password",
      })
    }

    const admin = await Admin.findById(req.admin.id).select("+password")

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      })
    }

    // Check current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword)

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      })
    }

    // Update password
    admin.password = newPassword
    await admin.save()

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @access  Private
const logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
}
