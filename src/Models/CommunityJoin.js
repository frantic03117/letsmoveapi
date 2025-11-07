const { Schema, model } = require("mongoose");

const communityJoinSchema = new Schema(
    {
        community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["member", "moderator", "admin"], default: "member" },
    },
    { timestamps: true }
);
communityJoinSchema.index({ community: 1, user: 1 }, { unique: true });

module.exports = model("CommunityJoin", communityJoinSchema);
