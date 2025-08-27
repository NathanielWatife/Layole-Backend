const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Admin = require("../models/Admin");

// Load the public key
const publicKeyPath = path.resolve(__dirname, "../public.pem");
// 
if (!fs.existsSync(publicKeyPath)) {
    throw new Error("Public Key not found. Generate key again.");
}

const publicKey = fs.readFileSync(publicKeyPath, "utf8");


const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).jsonn({
                success: false,
                message: "No token provided, authorization denied."
            });
        }

        const token = authHeader.replace("Bearer ", "");

        //  verify token with public
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"],
        });

        // find the admin and exclude the password
        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found, authorization denied",
            });
        }

        if (!admin.isActive){
            return res.status(401).json({
                success: false,
                message: "Admin account is deactivated.",
            });
        }

        // add the admin to request
        req.admin = admin;
        next();
    } catch (error) {
        console.error("Admin middleware error:", error.message);

        if (error.name === "TokenExpiredError"){
            return res.status(401).json({
                success: false,
                message: "Token is expired.",
            });
        }

        if (error.name === "JsonWenTokenError"){
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            });
        }

        res.status(401).json({
            success: false,
            message: "Token is not valid.",
        });
    }
};

module.exports = adminAuth;