const mongoose = require("mongoose");

const ChallengeParticipantSchema = new mongoose.Schema({
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    team_name: {
        type: String,
        default: null
    },
    joined_at: {
        type: Date,
        default: Date.now
    },
    leave_at: {
        type: Date,
        default: null
    },
    progress_value: {
        type: Number,
        default: 0
    },
    progress_unit: {
        type: String,
        default: ""
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    rank: {
        type: Number,
        default: null
    },
    badges: {
        type: [String],
        default: []
    },

});

ChallengeParticipantSchema.pre("save", function (next) {
    this.last_updated = new Date();
    next();
});

module.exports = mongoose.model("ChallengeParticipant", ChallengeParticipantSchema);
