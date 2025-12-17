const { Schema, model } = require("mongoose");
const fileSchema = new Schema({
    url: { type: String },
    type: { type: String, enum: ["image", "video", "gif"], default: "image" },
    metadata: {
        size: Number,
        width: Number,
        height: Number,
        format: String,
    },
});
const schema = new Schema({
    category: [{
        type: Schema.Types.ObjectId,
        ref: "Setting"
    }],
    title: {
        type: String,
        trim: true
    },
    files: [fileSchema],
    address: String,
    country: {
        type: Schema.Types.ObjectId,
        ref: "Country"
    },
    city: String,
    mode: {
        type: String,
        default: "Offline"
    },
    event_start_at: Date,
    event_end_at: Date,
    min_age_limit: Number,
    seating_arrangement: String,
    kid_friendly: {
        type: String,
        enum: ['Yes', 'No'],
        default: "No"
    },
    pet_friendly: {
        type: String,
        enum: ['Yes', 'No'],
        default: "No"
    },
    short_description: String,
    description: String,
    terms: String,
    tags: [{ type: String, trim: true }],
    organiser: String,
    author: {
        type: Schema.Types.ObjectId,
    },
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    members_count: { type: Number, default: 0 },
    visibility: {
        type: String,
        enum: ["public", "private", "followers"],
        default: "public",
    },
}, { timestamps: true });
schema.pre("save", function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

module.exports = new model('Event', schema);