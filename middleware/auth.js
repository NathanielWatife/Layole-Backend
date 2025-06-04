const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get admin from token
      const admin = await Admin.findById(decoded.id)

      if (!admin) {
        return res.status(401).json({
          success: false,
          error: "Token is not valid. Admin not found.",
        })
      }

      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          error: "Account is deactivated.",
        })
      }

      // Add admin to request object
      req.admin = {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Token is not valid.",
      })
    }
  } catch (error) {
    next(error)
  }
}

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Authentication required.",
      })
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.admin.role}' is not authorized.`,
      })
    }

    next()
  }
}

module.exports = { protect, authorize }
