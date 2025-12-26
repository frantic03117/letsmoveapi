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
        // Validate time range
        if (this.end_time < this.start_time) {
            return next(new Error("end_time must be after start_time"));
        }

        // Set activity_date (start of day)
        const date = new Date(this.start_time);
        date.setHours(0, 0, 0, 0);
        this.activity_date = date;

        // Duration in minutes
        const durationMinutes =
            (this.end_time - this.start_time) / (1000 * 60);

        this.duration = Math.round(durationMinutes);

        // Activity value in HOURS (2 decimal precision)
        this.activity_value = Number(
            (durationMinutes / 60).toFixed(2)
        );

        // Optional: auto-set unit
        this.activity_unit = "hours";
    }

    next();
});

module.exports = new model('UserActivity', useractivityschema);