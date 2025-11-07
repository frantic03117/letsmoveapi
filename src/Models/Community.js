const { Schema, model } = require("mongoose");
const fileSchema = new Schema({
    url: { type: String },
    description: { type: String },
    type: { type: String, enum: ["image", "video", "gif"], default: "image" },
    metadata: {
        size: Number,
        width: Number,
        height: Number,
        format: String,
    },
});
const schema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
    },
    title: String,
    slug: String,
    files: [fileSchema],
    short_description: String,
    description: String,
    tags: [{ type: String, trim: true }],
    author: {
        type: Schema.Types.ObjectId,
    },
    visibility: {
        type: String,
        enum: ["public", "private", "followers"],
        default: "public",
    },

}, { timestamps: true });
// --- Auto-generate slug from title if not provided ---
communitySchema.pre("save", function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});
module.exports = new model('Community', schema);