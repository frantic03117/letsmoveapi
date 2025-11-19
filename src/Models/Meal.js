const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
    url: { type: String },
    type: { type: String, enum: ["image", "video", "gif"], default: "image" },
    metadata: {
        size: Number,
        format: String,
    },
});
const MealSchema = new mongoose.Schema(
    {
        slug: String,
        title: {
            type: String
        },
        video: String,
        meal_type: {
            type: String,
        },
        protein: {
            type: Number,
            min: 0,
        },
        calories: {
            type: Number,
            min: 0,
        },
        overview: {
            type: String,
        },
        Serving: {
            type: String,
        },
        banner: {
            type: String,
        },
        media: [fileSchema],
        ingredients: [
            {
                name: { type: String, },
                quantity: { type: String, },
            },
        ],
        recipe_steps: [
            {
                step_number: { type: Number, },
                instruction: { type: String, },
            }
        ],
        carbs: {
            type: Number,
            default: 0,
        },
        fats: {
            type: Number,
            default: 0,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Meal", MealSchema);
