const Workout = require("../Models/Workout");


// CREATE WORKOUT
exports.createWorkout = async (req, res) => {
    try {
         const requiredFields = ["title", "description", "category"];
        const emptyFields = requiredFields.filter((field) => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.status(500).json({
                success: 0,
                message: "The following fields are required: " + emptyFields.join(", "),
                fields: emptyFields,
            });
        }
        const { title, category, description, duration, calories, videos, level } = req.body;

        const banner = req.file ? req.file.path : null;

        const parsedVideos = videos ? JSON.parse(videos) : [];

        const workout = await Workout.create({
            title,
            category,
            description,
            duration,
            calories,
            level,
            banner,
            videos: parsedVideos
        });

        res.status(201).json({
            success: 1,
            message: "Workout created successfully",
            data: workout
        });

    } catch (error) {
        res.status(500).json({ success: 0, error: error.message });
    }
};


// GET ALL WORKOUTS
exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find().populate("category");
        res.json({ success: 1, data: workouts });
    } catch (error) {
        res.status(500).json({ success: 0, error: error.message });
    }
};


// GET SINGLE WORKOUT
exports.getWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id).populate("category");

        if (!workout) return res.status(404).json({ success: 0, message: "Workout not found" });

        res.json({ success: 1, data: workout });

    } catch (error) {
        res.status(500).json({ success: 0, error: error.message });
    }
};


// UPDATE WORKOUT
exports.updateWorkout = async (req, res) => {
    try {
        const { videos } = req.body;
        let updateData = { ...req.body };

        if (videos) updateData.videos = JSON.parse(videos);

        if (req.file) updateData.banner = req.file.path;

        const updated = await Workout.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.json({
            success: 1,
            message: "Workout updated successfully",
            data: updated
        });

    } catch (error) {
        res.status(500).json({ success: 0, error: error.message });
    }
};


// DELETE WORKOUT
exports.deleteWorkout = async (req, res) => {
    try {
        await Workout.findByIdAndDelete(req.params.id);
        res.json({ success: 1, message: "Workout deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: 0, error: error.message });
    }
};
