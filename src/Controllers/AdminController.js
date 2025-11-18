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
