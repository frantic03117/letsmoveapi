const Workout = require("../Models/Workout");


// CREATE WORKOUT
exports.createWorkout = async (req, res) => {
    try {
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
            success: true,
            message: "Workout created successfully",
            data: workout
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// GET ALL WORKOUTS
exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find().populate("category");
        res.json({ success: true, data: workouts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// GET SINGLE WORKOUT
exports.getWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id).populate("category");

        if (!workout) return res.status(404).json({ success: false, message: "Workout not found" });

        res.json({ success: true, data: workout });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
            success: true,
            message: "Workout updated successfully",
            data: updated
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// DELETE WORKOUT
exports.deleteWorkout = async (req, res) => {
    try {
        await Workout.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Workout deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
