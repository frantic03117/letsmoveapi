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

useractivityschema.pre("save", function (next) {
    if (this.start_time && this.end_time) {
        // Ensure end_time is after start_time
        if (this.end_time < this.start_time) {
            return next(new Error("end_time must be after start_time"));
        }

        // Set activity_date (date only, without time)
        const date = new Date(this.start_time);
        date.setHours(0, 0, 0, 0);
        this.activity_date = date;


        // Calculate duration in minutes
        this.duration = Math.round(
            (this.end_time - this.start_time) / (1000 * 60)
        );
        this.activity_value = Math.round(
            (this.end_time - this.start_time) / (1000 * 60)
        );
    }

    next();
});
module.exports = new model('UserActivity', useractivityschema);