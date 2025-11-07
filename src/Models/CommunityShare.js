const { Schema, model } = require("mongoose");

const communityShareSchema = new Schema(
    {
        community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        caption: { type: String },
    },
    { timestamps: true }
);

communityShareSchema.index({ community: 1, user: 1 }, { unique: true });

module.exports = model("CommunityShare", communityShareSchema);
