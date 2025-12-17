const { Schema, model } = require("mongoose");

const eventJoinSchema = new Schema(
    {
        event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["member", "moderator", "admin"], default: "member" },
    },
    { timestamps: true }
);
// eventJoinSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = model("EventJoin", eventJoinSchema);
