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
        if (this.end_time < this.start_time) {
            return next(new Error("end_time must be after start_time"));
        }
        const date = new Date(this.start_time);
        date.setUTCHours(0, 0, 0, 0);
        this.activity_date = date;
        const durationMinutes =
            (this.end_time - this.start_time) / (1000 * 60);
        this.duration = Math.round(durationMinutes);
        this.activity_value = Number((durationMinutes / 60).toFixed(2));
        this.activity_unit = "hours";
    }
    next();
});


module.exports = new model('UserActivity', useractivityschema);