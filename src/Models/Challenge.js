const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
    url: { type: String },
    type: { type: String, enum: ["image", "video", "gif"], default: "image" },
    metadata: {
        size: Number,
        width: Number,
        height: Number,
        format: String,
    },
});
const ChallengeSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    description: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Setting"
    },
    type: { type: String, enum: ["individual", "team"], default: "individual" },
    metric: {
        type: String,
        enum: ["reps", "distance", "time", "attendance", "steps", "weight", "percentage", "custom"],
        default: "custom"
    },
    target_value: { type: Number },
    target_units: { type: String, default: "" },
    start_date: { type: Date },
    end_date: { type: Date },
    duration_days: { type: Number },
    scoring_method: {
        type: String,
        enum: ["points", "percentage", "value", "time_based"],
        default: "value"
    },
    max_points: { type: Number, default: 100 },
    reward: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        type: {
            type: String,
            enum: ["voucher", "discount", "gift", "membership", "recognition", "custom"],
            default: "recognition"
        }
    },
    banner_image: { type: String, default: null },
    media: [fileSchema],
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });

// auto calculate duration
ChallengeSchema.pre("save", function (next) {
    if (this.start_date && this.end_date) {
        const diff = Math.ceil((this.end_date - this.start_date) / (1000 * 60 * 60 * 24));
        this.duration_days = diff;
    }
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
