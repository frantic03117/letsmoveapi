const { Schema, model } = require("mongoose");

const communityCommentSchema = new Schema(
    {
        community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        parent_comment: { type: Schema.Types.ObjectId, ref: "CommunityComment", default: null },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = model("CommunityComment", communityCommentSchema);
