const AppNotification = require("../Models/AppNotification");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const Workout = require("../Models/Workout");
const Event = require("../Models/Event");
const Meal = require("../Models/Meal");
const Challenge = require("../Models/Challenge");
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
exports.dashboard = async (req, res) => {
    try {
        const [
            total_users,
            total_workouts,
            total_meals,
            total_events,
            total_notification,
            joinedChallenges,
            notJoinedChallenges,
            categorywise_workouts,
            meal_categorywise
        ] = await Promise.all([

            User.countDocuments({ role: { $ne: "Admin" } }),
            Workout.countDocuments(),
            Meal.countDocuments(),
            Event.countDocuments(),
            AppNotification.countDocuments(),

            // Challenges with participants
            Challenge.aggregate([
                {
                    $lookup: {
                        from: "challengeparticipants",
                        localField: "_id",
                        foreignField: "challenge",
                        as: "participants"
                    }
                },
                {
                    $match: { "participants.0": { $exists: true } }
                },
                {
                    $count: "count"
                }
            ]),

            // Challenges without participants
            Challenge.aggregate([
                {
                    $lookup: {
                        from: "challengeparticipants",
                        localField: "_id",
                        foreignField: "challenge",
                        as: "participants"
                    }
                },
                {
                    $match: { participants: { $size: 0 } }
                },
                {
                    $count: "count"
                }
            ]),

            // Category-wise workouts
            Workout.aggregate([
                { $match: { isActive: true } },
                { $unwind: "$category" },
                {
                    $group: {
                        _id: "$category",
                        workoutCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "settings",
                        localField: "_id",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" },
                {
                    $project: {
                        _id: 0,
                        categoryId: "$category._id",
                        categoryName: "$category.title",
                        workoutCount: 1
                    }
                }
            ]),

            // Meal category-wise meals
            Meal.aggregate([
                { $match: { is_active: true, meal_type: { $ne: null } } },
                {
                    $group: {
                        _id: "$meal_type",
                        mealCount: { $sum: 1 },
                        meals: {
                            $push: {
                                _id: "$_id",
                                title: "$title",
                                calories: "$calories",
                                protein: "$protein",
                                banner: "$banner"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "settings",
                        localField: "_id",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" },
                {
                    $project: {
                        _id: 0,
                        categoryId: "$category._id",
                        categoryName: "$category.title",
                        mealCount: 1,
                        meals: 1
                    }
                }
            ])
        ]);

        const data = {
            total_users,
            total_workouts,
            total_meals,
            total_events,
            total_notification,

            joinedChallenges: joinedChallenges[0]?.count || 0,
            notJoinedChallenges: notJoinedChallenges[0]?.count || 0,

            categorywise_workouts,
            meal_categorywise
        };

        return res.json({
            success: 1,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message
        });
    }
};
