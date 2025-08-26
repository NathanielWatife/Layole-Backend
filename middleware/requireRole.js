const requireRole = (allowedRoles) => {
    return (req, res,next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated as admin.",
            });
        }

        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions"
            });
        }
        next();
    };
};

module.exports = requireRole;