
const mongoose = require("mongoose");
const DailyGoalModel = require("../Models/DailyGoal.model");

// ➕ CREATE GOAL
exports.createGoal = async (req, res) => {
    try {
        const fields = ['goal_type', 'goal_value', 'goal_unit', 'goal_frequency'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.status(500).json({ success: 0, errors: 'The following fields are required:', fields: emptyFields });
        }
        const goal = await DailyGoalModel.create({
            user: req.user._id,
            goal_type: req.body.goal_type,
            goal_value: req.body.goal_value,
            goal_unit: req.body.goal_unit,
            goal_frequency: req.body.goal_frequency
        });

        return res.status(201).json({
            success: 1,
            message: "Goal created successfully",
            data: goal
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📥 GET ALL USER GOALS
exports.getGoals = async (req, res) => {
    try {
        const { goal_frequency, goal_type } = req.query;

        const query = { user: req.user._id };
        if (goal_frequency) query.goal_frequency = goal_frequency;
        if (goal_type) query.goal_type = goal_type;
        const goals = await DailyGoalModel.find(query).sort({ createdAt: -1 });
        return res.json({
            success: 1,
            data: goals
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📄 GET SINGLE GOAL
exports.getGoalById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: 0, message: "Invalid goal ID" });
        }

        const goal = await DailyGoalModel.findOne({
            _id: id,
            user: req.user._id
        });

        if (!goal) {
            return res.status(404).json({ success: 0, message: "Goal not found" });
        }

        return res.json({
            success: 1,
            data: goal
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// ✏️ UPDATE GOAL
exports.updateGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await DailyGoalModel.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                $set: {
                    goal_type: req.body.goal_type,
                    goal_value: req.body.goal_value,
                    goal_unit: req.body.goal_unit,
                    goal_frequency: req.body.goal_frequency
                }
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: 0, message: "Goal not found" });
        }

        return res.json({
            success: 1,
            message: "Goal updated successfully",
            data: updated
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 🗑️ DELETE GOAL
exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await DailyGoalModel.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if (!deleted) {
            return res.status(404).json({ success: 0, message: "Goal not found" });
        }

        return res.json({
            success: 1,
            message: "Goal deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
