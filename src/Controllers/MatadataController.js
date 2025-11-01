import { validationResult } from "express-validator";
import Matadata from "../Models/Matadata";


export const createMatadata = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ success: 0, message: errors.array()[0].msg })
        }
        const data = req.body;
        const rsp = await Matadata.create(data);
        return res.json({ success: 1, message: "Created successfully", data: rsp })
    } catch (err) {
        res.status(500).json({ success: 0, message: err.message });
    }
}
export const deleteMatadata = async (req, res) => {
    try {
        const matatdata = await Matadata.findByIdAndDelete(req.params.id);
        if (!matatdata) return res.status(404).json({ error: "Matatdata not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
    }
}
export const updateMatadata = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const matatdata = await Matadata.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!matatdata) return res.status(404).json({ error: "Matatdata not found" });
        res.status(200).json({ message: "Updated successfully", data: matatdata });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
}
export const getAllMatadata = async (req, res) => {
    try {
        const matatdatas = await Matadata.find().sort({ createdAt: -1 });
        res.status(200).json({ data: matatdatas, success: 1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

