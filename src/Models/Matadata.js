const { Schema, model } = require("mongoose");

const schema = new Schema({
    page_name: String,
    name: String,
    type: String,
    required: {
        type: Boolean,
        default: false
    },
    default: String,
    enum: [String],
    ref: String,
    trim: {
        type: Boolean,
        default: false
    },
    label: String,
    placeholder: String,
    order: Number
}, { timestamps: true });
module.exports = new model('Matadata', schema);