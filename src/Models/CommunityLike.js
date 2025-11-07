const { Schema, model } = require("mongoose");

const communityLikeSchema = new Schema(
    {
        community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);
communityLikeSchema.index({ community: 1, user: 1 }, { unique: true });

module.exports = model("CommunityLike", communityLikeSchema);
