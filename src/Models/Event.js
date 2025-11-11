const { Schema, model } = require("mongoose");

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
    },
    city: String,
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
        default: "Offline"
    },
    event_start_date: Date,
    event_end_date: Date,
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


module.exports = new model('Event', schema);