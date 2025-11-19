const { Schema, model } = require("mongoose");

const videoSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: String },
}, { timestamps: true });

const wschema = new Schema({
    title: { type: String, required: true },
    category: [
        {
            type: Schema.Types.ObjectId,
            ref: "Setting"
        }
    ],
    banner: { type: String },            // file URL
    videos: [videoSchema],
    description: { type: String },
    duration: { type: String },
    calories: { type: String },

    isActive: { type: Boolean, default: true },   // helpful field
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" } // optional
}, { timestamps: true });

module.exports = model("Workout", wschema);
