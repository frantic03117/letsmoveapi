const { Schema, Types, model } = require("mongoose");

const schema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    goal_type: String,
    goal_value: Number,
    goal_unit: String,
    goal_frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
        default: "Daily"
    }
}, { timestamps: true });

module.exports = model('DailyGoal', schema);
