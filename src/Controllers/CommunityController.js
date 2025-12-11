
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const Community = require("../Models/Community");
const CommunityLike = require("../Models/CommunityLike");
const CommunityComment = require("../Models/CommunityComment");
const CommunityShare = require("../Models/CommunityShare");
const CommunityJoin = require("../Models/CommunityJoin");

// Create new community post
exports.createCommunity = async (req, res) => {
    try {
        const requiredFields = ["title", "short_description", "category"];
        const emptyFields = requiredFields.filter((field) => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({
                success: 0,
                message:
                    "The following fields are required: " + emptyFields.join(", "),
                fields: emptyFields,
            });
        }

        const { title, short_description, description, category, terms } = req.body;

        // --- Map uploaded files ---
        // Handle case where multiple descriptions come as array or single string
        let descriptions = req.body.descriptions || [];
        if (!Array.isArray(descriptions)) descriptions = [descriptions];

        const files = (req.files || []).map((file, i) => ({
            url: `/uploads/${file.filename}`,
            description: descriptions[i] || "",
            type: file.mimetype.startsWith("video")
                ? "video"
                : file.mimetype.startsWith("audio")
                    ? "audio"
                    : "image",
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
            terms,
            tags: req.body.tags
        });

        await post.save();

        return res.status(201).json({
            success: 1,
            message: " Community post created successfully!",
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
        community.tags = req.body.tags || community.tags;
        community.terms = req.body.terms || community.terms;

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

        const communities = await Community.find(query)
            .sort({ [sort]: order === "asc" ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("author", "first_name profile_image email",)
            .populate("category")
            .lean(); // make lean to modify freely


        for (const c of communities) {
            const [comments, likes, shares, members, isJoinedByMe] = await Promise.all([
                // first 10 comments
                CommunityComment.find({ community: c._id, parent_comment: null })
                    .populate("user", "first_name profile_image email")
                    .sort({ createdAt: 1 })
                    .limit(10)
                    .lean(),

                // last 10 likes
                CommunityLike.find({ community: c._id })
                    .populate("user", "first_name profile_image email")
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean(),

                // last 10 shares
                CommunityShare.find({ community: c._id })
                    .populate("user", "first_name profile_image email")
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean(),
                // last 10 members
                CommunityJoin.find({ community: c._id }).populate("user", "first_name profile_image email").sort({ createdAt: -1 })
                    .limit(10)
                    .lean(),
                CommunityJoin.findOne({ user: req?.user?._id })
            ]);

            c.comments_preview = comments.map((com) => ({
                user: com.user,
                content: com.content,
                commentedAt: com.createdAt,
            }));

            c.likes_preview = likes.map((like) => ({
                user: like.user,
                likedAt: like.createdAt,
            }));

            c.shares_preview = shares.map((share) => ({
                user: share.user,
                caption: share.caption,
                sharedAt: share.createdAt,
            }));
            c.members_preview = members
            c.isJoinedByMe = isJoinedByMe ? true : false
        }
        const pagination = {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
        return res.status(200).json({
            success: 1,
            pagination,
            data: communities,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params; // community ID
        const userId = req.user._id;

        const existing = await CommunityLike.findOne({ community: id, user: userId });

        if (existing) {
            await CommunityLike.deleteOne({ _id: existing._id });
            await Community.findByIdAndUpdate(id, { $inc: { likes_count: -1 } });
            return res.json({ success: 1, message: "Unliked" });
        }

        await CommunityLike.create({ community: id, user: userId });
        await Community.findByIdAndUpdate(id, { $inc: { likes_count: 1 } });

        return res.json({ success: 1, message: " Liked" });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
exports.addComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { id } = req.params; // community ID
        const { content, parent_comment } = req.body;

        const comment = await CommunityComment.create({
            community: id,
            user: req.user._id,
            parent_comment: parent_comment || null,
            content,
        });

        await Community.findByIdAndUpdate(id, { $inc: { comments_count: 1 } });

        return res.status(201).json({ success: 1, data: comment });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params; // community ID

        const comments = await CommunityComment.find({
            community: id,
            parent_comment: null,
        })
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .lean();

        // Fetch replies for each comment
        for (let comment of comments) {
            comment.replies = await CommunityComment.find({ parent_comment: comment._id })
                .populate("user", "name")
                .sort({ createdAt: 1 })
                .lean();
        }

        return res.json({ success: 1, data: comments });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
exports.shareCommunity = async (req, res) => {
    try {
        const { id } = req.params; // community ID
        const { caption } = req.body;
        const userId = req.user._id;

        const existing = await CommunityShare.findOne({ community: id, user: userId });
        if (existing) {
            return res.status(400).json({ success: 0, message: "Already shared this post" });
        }

        await CommunityShare.create({ community: id, user: userId, caption });
        await Community.findByIdAndUpdate(id, { $inc: { shares_count: 1 } });

        return res.status(201).json({ success: 1, message: " Shared successfully" });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
