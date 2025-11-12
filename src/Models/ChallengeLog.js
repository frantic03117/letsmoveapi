const mongoose = require("mongoose");

const ChallengeLogSchema = new mongoose.Schema({
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChallengeParticipant",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    log_date: {
        type: Date,
        default: Date.now
    },
    value: {
        type: Number,
        required: true // e.g., 5 km, 30 pushups, etc.
    },
    unit: {
        type: String,
        default: "" //e.g., steps, pushed, glass
    },
    note: {
        type: String,
        default: ""
    },
    media: [
        {
            url: String,
            type: { type: String, enum: ["image", "video"], default: "image" }
        }
    ],
    verified: {
        type: Boolean,
        default: false
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    verified_at: {
        type: Date,
        default: null
    }
});

ChallengeLogSchema.pre("save", function (next) {
    if (this.verified && !this.verified_at) {
        this.verified_at = new Date();
    }
    next();
});

module.exports = mongoose.model("ChallengeLog", ChallengeLogSchema);
