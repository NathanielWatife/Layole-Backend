const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
    try {
        //  get token from header
        const token = req.headers("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided, authorization denied.",
            });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find admin and exclude password
        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Admin not found or inactive, authorization denied.",
            });
        }

        // add admin to request object
        req.admin = admin;
        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(401).json({
            success: false,
            message: "Token is not valid.",
        });
    }
};

module.exports = adminAuth;