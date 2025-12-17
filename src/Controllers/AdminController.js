const AppNotification = require("../Models/AppNotification");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.admin_auth_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, role: "Admin", password });
        if (!admin) {
            return res.status(404).json({
                success: 0,
                message: "Admin not found",
            });
        }
        // 3. Create token
        const token = jwt.sign(
            { user: { _id: admin._id, role: admin.role } },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );
        // 4. Respond
        return res.status(200).json({
            success: 1,
            message: "Admin login successful",
            data: token,
        });

    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message
        });
    }
};
exports.notificationList = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role; // 'User' | 'Admin'

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build visibility filter
        const visibilityFilter =
            role === "Admin"
                ? { show_to: { $in: ["Admin", "Both"] } }
                : { show_to: { $in: ["User", "Both"] } };

        const filter = {
            $or: [
                { user: userId },       // personal notifications
                { user: null },         // global/bulk notifications
            ],
            ...visibilityFilter
        };

        const [notifications, total] = await Promise.all([
            AppNotification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            AppNotification.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: 1,
            page,
            limit,
            total,
            unread: notifications.filter(n => !n.is_read).length,
            data: notifications,
        });

    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};
