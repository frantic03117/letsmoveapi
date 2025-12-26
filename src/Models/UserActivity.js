const { Schema, model } = require("mongoose");

const useractivityschema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    activity_type: String,
    activity_value: String,
    activity_unit: String,
    activity_date: Date,
    start_time: Date,
    end_time: Date,
    duration: Number,
    quality: Number
}, { timestamps: true });


module.exports = new model('UserActivity', useractivityschema);