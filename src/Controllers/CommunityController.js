
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const Community = require("../Models/Community");

// Create new community post
exports.createCommunity = async (req, res) => {
    try {
        // --- Validate incoming fields ---
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Delete uploaded files if validation fails
            if (req.files?.length) {
                req.files.forEach((file) => fs.unlinkSync(file.path));
            }
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, short_description, description, category } = req.body;

        // --- Map uploaded files ---
        const files = (req.files || []).map((file) => ({
            url: `/uploads/${file.filename}`,
            description: req.body[`file_description_${file.originalname}`] || "", // optional caption per file
            type: file.mimetype.startsWith("video") ? "video" : "image",
            metadata: {
                size: file.size,
                format: path.extname(file.originalname).slice(1),
            },
        }));

        // --- Create document ---
        const post = new Community({
            title,
            short_description,
            description,
            category,
            author: req.user?._id,
            files,
        });

        await post.save();

        return res.status(201).json({
            success: 1,
            message: "✅ Community post created successfully!",
            data: post,
        });
    } catch (error) {

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

exports.deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({ success: 0, message: "Post not found" });
        }

        // Delete files from storage if they exist
        community.files.forEach((file) => {
            const filePath = path.join(__dirname, "..", file.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        await Community.deleteOne({ _id: id });

        return res.status(200).json({
            success: 1,
            message: "✅ Community post deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};
exports.updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.files?.length) req.files.forEach((f) => fs.unlinkSync(f.path));
            return res.status(400).json({ errors: errors.array() });
        }

        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ success: 0, message: "Post not found" });
        }

        const { title, short_description, description, category } = req.body;

        // Handle new file uploads
        const newFiles = (req.files || []).map((file) => ({
            url: `/uploads/${file.filename}`,
            description: req.body[`file_description_${file.originalname}`] || "",
            type: file.mimetype.startsWith("video") ? "video" : "image",
            metadata: {
                size: file.size,
                format: path.extname(file.originalname).slice(1),
            },
        }));

        // Optionally remove old files if user specifies
        if (req.body.remove_files === "true") {
            community.files.forEach((file) => {
                const filePath = path.join(__dirname, "..", file.url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
            community.files = newFiles;
        } else {
            community.files.push(...newFiles);
        }

        community.title = title || community.title;
        community.short_description = short_description || community.short_description;
        community.description = description || community.description;
        community.category = category || community.category;

        await community.save();

        return res.status(200).json({
            success: 1,
            message: "✅ Community post updated successfully",
            data: community,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};
exports.getAllCommunities = async (req, res) => {
    try {
        const {
            category,
            author,
            search,
            visibility,
            sort = "createdAt",
            order = "desc",
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        if (category) query.category = category;
        if (author) query.author = author;
        if (visibility) query.visibility = visibility;

        if (search) {
            query.$or = [
                { title: new RegExp(search, "i") },
                { description: new RegExp(search, "i") },
                { short_description: new RegExp(search, "i") },
            ];
        }

        const total = await Community.countDocuments(query);
        const data = await Community.find(query)
            .sort({ [sort]: order === "asc" ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("author", "name email")
            .populate("category", "name");
        return res.status(200).json({
            success: 1,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data,
        });
    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};