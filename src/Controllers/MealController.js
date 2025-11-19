

// ==============================
// CREATE MEAL

const Meal = require("../Models/Meal");

// ==============================
exports.createMeal = async (req, res) => {
    try {
        const requiredFields = ["title", "meal_type", "protein", "calories"];
        const missing = requiredFields.filter(field => !req.body[field]);

        if (missing.length) {
            return res.status(500).json({
                success: 0,
                message: "Missing required fields: " + missing.join(", "),
                fields: missing,
            });
        }

        const data = { ...req.body };

        // ---------------------------
        // Parse JSON fields safely
        // ---------------------------
        const jsonFields = ["ingredients", "recipe_steps"];

        jsonFields.forEach(field => {
            if (data[field]) {
                try {
                    data[field] = JSON.parse(data[field]);
                } catch (err) {
                    console.log(`Failed to parse ${field}`, err);
                }
            }
        });

        // ---------------------------
        // Handle file uploads
        // ---------------------------
        if (req.files?.banner) {
            data.banner = req.files.banner[0].path;
        }

        if (req.files?.media) {
            data.media = req.files.media.map(file => ({
                url: file.path,
                type: file.mimetype.split("/")[0],
                metadata: {
                    size: file.size,
                    format: file.mimetype.split("/")[1],
                },
            }));
        }

        // ---------------------------
        // Save meal
        // ---------------------------
        const meal = await Meal.create(data);

        return res.status(201).json({
            success: 1,
            message: "Meal created successfully",
            data: meal,
        });

    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};



// ==============================
// GET ALL MEALS
// ==============================
exports.getMeals = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            meal_type,
            service,
            min_calories,
            max_calories,
            min_protein,
            max_protein,
            search,
            id,
            sort = "-createdAt"
        } = req.query;

        let query = {};

        // ---------------------------
        // FILTERS
        // ---------------------------
        if (id) query._id = id;
        if (meal_type) query.meal_type = meal_type;

        if (service) query.service = service;

        if (min_calories || max_calories) {
            query.calories = {};
            if (min_calories) query.calories.$gte = Number(min_calories);
            if (max_calories) query.calories.$lte = Number(max_calories);
        }

        if (min_protein || max_protein) {
            query.protein = {};
            if (min_protein) query.protein.$gte = Number(min_protein);
            if (max_protein) query.protein.$lte = Number(max_protein);
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        // Pagination numbers
        const skip = (page - 1) * limit;

        // ---------------------------
        // MAIN QUERY
        // ---------------------------
        const meals = await Meal.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Meal.countDocuments(query);
        const pagination = {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
        return res.json({
            success: 1,
            data: meals,
            pagination: pagination
        });

    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};



// ==============================
// GET SINGLE MEAL
// ==============================
exports.getMealById = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id)

        if (!meal) {
            return res.json({ success: 0, message: "Meal not found" });
        }

        return res.json({ success: 1, data: meal });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};


// ==============================
// UPDATE MEAL
// ==============================
exports.updateMeal = async (req, res) => {
    try {
        const mealId = req.params.id;
        let meal = await Meal.findById(mealId);

        if (!meal) {
            return res.status(404).json({
                success: 0,
                message: "Meal not found"
            });
        }

        let data = req.body;

        // Parse JSON fields coming as string
        if (data.ingredients && typeof data.ingredients === "string") {
            data.ingredients = JSON.parse(data.ingredients);
        }
        if (data.recipe_steps && typeof data.recipe_steps === "string") {
            data.recipe_steps = JSON.parse(data.recipe_steps);
        }

        // Update banner file
        if (req.files?.banner) {
            data.banner = req.files.banner[0].path;
        }

        // Update media files (append new)
        if (req.files?.media && req.files.media.length > 0) {
            const newMedia = req.files.media.map(file => ({
                url: file.path,
                type: file.mimetype.split("/")[0],
                metadata: {
                    size: file.size,
                    format: file.mimetype.split("/")[1]
                }
            }));

            // merge existing + new
            data.media = [...meal.media, ...newMedia];
        }

        // Allow user to delete particular media items
        if (data.remove_media) {
            // remove_media must be JSON array of URLs
            let removeList = JSON.parse(data.remove_media);

            data.media = meal.media.filter(m => !removeList.includes(m.url));
        }

        // Update in DB
        const updated = await Meal.findByIdAndUpdate(mealId, data, {
            new: true
        });

        return res.json({
            success: 1,
            message: "Meal updated successfully",
            data: updated
        });

    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message
        });
    }
};



// ==============================
// DELETE MEAL
// ==============================
exports.deleteMeal = async (req, res) => {
    try {
        const meal = await Meal.findByIdAndDelete(req.params.id);

        if (!meal) {
            return res.json({ success: 0, message: "Meal not found" });
        }

        return res.json({ success: 1, message: "Meal deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
