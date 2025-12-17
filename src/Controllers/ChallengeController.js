const Challenge = require("../Models/Challenge");
const ChallengeLog = require("../Models/ChallengeLog");
const ChallengeParticipant = require("../Models/ChallengeParticipant");

const mongoose = require("mongoose");
// 📌 CREATE CHALLENGE
exports.createChallenge = async (req, res) => {
    try {
        const requiredFields = ["title", "short_description", "category"];
        const emptyFields = requiredFields.filter((field) => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({
                success: 0,
                message: "The following fields are required: " + emptyFields.join(", "),
                fields: emptyFields,
            });
        }
        const data = req.body;
        if (req.files.banner) {
            data['banner'] = req.files.banner[0].path;
        }
        if (req.files.media) {
            data['media'] = req.files.media.map(file => ({
                url: file.path,
                type: file.mimetype.split('/')[0], // image, video, gif
                metadata: {
                    size: file.size,
                    format: file.mimetype.split('/')[1] // jpg, png, mp4, etc.
                }
            }));
        }
        const challenge = await Challenge.create(data);
        return res.status(201).json({ success: 1, message: "Challenge created", data: challenge });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📌 UPDATE CHALLENGE
exports.updateChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;

        let data = req.body;

        // Convert weekly_plan if it's sent as JSON string (common in multipart form-data)
        if (data.weekly_plan && typeof data.weekly_plan === "string") {
            try {
                data.weekly_plan = JSON.parse(data.weekly_plan);
            } catch (e) {
                return res.json({
                    success: 0,
                    message: "Invalid weekly_plan format. Must be valid JSON."
                });
            }
        }

        // ---------------------------
        // Handle banner upload
        // ---------------------------
        if (req.files?.banner) {
            data.banner = req.files.banner[0].path;
        }

        // ---------------------------
        // Handle media upload
        // ---------------------------
        if (req.files?.media) {
            const mediaFiles = req.files.media.map(file => ({
                url: file.path,
                type: file.mimetype.split("/")[0], // image, video, gif
                metadata: {
                    size: file.size,
                    format: file.mimetype.split("/")[1]
                }
            }));

            // If you want to REPLACE media
            // data.media = mediaFiles;

            // If you want to APPEND instead of replace:
            const existing = await Challenge.findById(challengeId);
            data.media = [...existing.media, ...mediaFiles];
        }

        // ---------------------------
        // Update DB
        // ---------------------------
        const updated = await Challenge.findByIdAndUpdate(challengeId, data, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return res.status(404).json({
                success: 0,
                message: "Challenge not found",
            });
        }

        return res.json({
            success: 1,
            message: "Challenge updated successfully",
            data: updated,
        });

    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message,
        });
    }
};
;

// 📌 DELETE CHALLENGE
exports.deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        await Challenge.findByIdAndDelete(id);
        await ChallengeParticipant.deleteMany({ challenge_id: id });
        await ChallengeLog.deleteMany({ challenge_id: id });
        return res.json({ success: 1, message: "Challenge deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📌 GET ALL CHALLENGES (with filters)
exports.getChallenges = async (req, res) => {
    try {
        const { id, category, type, page = 1, limit = 10, isJoinedByMe } = req.query;
        const query = {};
        if (id) query._id = new mongoose.Types.ObjectId(id);
        if (category) query.category = new mongoose.Types.ObjectId(category);
        if (type) query.type = type;
        if (isJoinedByMe !== undefined && req.user) {
            // Get all challenge ids the user has joined
            const joined = await ChallengeParticipant.find({
                user: req.user._id,
                $or: [
                    { leave_at: null },
                    { leave_at: { $exists: false } }
                ]
            }).select("challenge");


            const joinedIds = joined.map(j => j.challenge);


            if (isJoinedByMe === "true") {
                // Only joined challenges
                query["_id"] = { $in: joinedIds };
            } else if (isJoinedByMe === "false") {
                // Only not joined challenges
                query["_id"] = { $nin: joinedIds };
            }
        }
        const challenges = await Challenge.aggregate([
            { $match: query },

            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: Number(limit) },

            // populate category
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            //isjoinedby me
            // check if current user joined + get joined object
            {
                $lookup: {
                    from: "challengeparticipants",
                    let: { challengeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$challenge", "$$challengeId"] },
                                        { $eq: ["$user", req.user._id] }
                                    ]
                                },
                                $or: [
                                    { leave_at: null },
                                    { leave_at: { $exists: false } }
                                ]
                            }
                        },
                        { $limit: 1 }
                    ],

                    as: "myParticipation"
                }
            },
            {
                $addFields: {
                    isJoinedByMe: { $gt: [{ $size: "$myParticipation" }, 0] },
                    joined: {
                        $cond: {
                            if: { $gt: [{ $size: "$myParticipation" }, 0] },
                            then: { $arrayElemAt: ["$myParticipation", 0] },
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    myParticipation: 0
                }
            },

            // members_preview
            {
                $lookup: {
                    from: "challengeparticipants",
                    let: { challengeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$challenge", "$$challengeId"] },
                                $or: [
                                    { leave_at: null },
                                    { leave_at: { $exists: false } }
                                ]
                            }
                        },
                        { $sort: { joined_at: 1 } },
                        { $limit: 3 }, // 👈 preview size
                        {
                            $lookup: {
                                from: "users",
                                localField: "user",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        {
                            $project: {
                                _id: 1,
                                team_name: 1,
                                progress_value: 1,
                                score: 1,
                                "user._id": 1,
                                "user.first_name": 1,
                                "user.last_name": 1,
                                "user.profile_image": 1
                            }
                        }
                    ],
                    as: "members_preview"
                }
            }
        ]);



        const total = await Challenge.countDocuments(query);
        const pagination = {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
        return res.json({
            success: 1,
            data: challenges,
            pagination: pagination,
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

exports.joinChallenge = async (req, res) => {
    try {
        const { challenge_id } = req.body;
        const user_id = req.user?.role == "User" ? req.user._id : req.body.user;
        if (!user_id) {
            return res.status(500).json({ success: 0, message: "No user found" });
        }
        const alreadyJoined = await ChallengeParticipant.findOne({ challenge: challenge_id, user: user_id, leave_at: null });
        if (alreadyJoined) {
            return res.status(400).json({ success: 0, message: "Already joined this challenge" });
        }

        const participant = await ChallengeParticipant.create({
            challenge: challenge_id,
            user: user_id,
            joined_at: new Date(),
        });

        return res.status(201).json({ success: 1, message: "Challenge joined", data: participant });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
exports.leaveChallenge = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { challenge_id } = req.params;
        await ChallengeParticipant.findOneAndUpdate({
            challenge: challenge_id,
            user: user_id,
        }, { $set: { leave_at: new Date(), } });
        return res.status(200).json({ success: 1, message: "Challenge updated successfully" });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}

// 📌 GET PARTICIPANTS
// 📌 GET PARTICIPANTS WITH LOGS + PAGINATION
exports.getParticipants = async (req, res) => {
    try {
        const { id, page = 1, limit = 10 } = req.query;

        // Filters
        let filter = {
            $or: [
                { leave_at: null },
                { leave_at: { $exists: false } }
            ]
        };
        if (id) filter.challenge = id;

        const skip = (page - 1) * limit;

        // -------------------------------
        // 📌 Fetch participants (paginated)
        // -------------------------------
        const participants = await ChallengeParticipant
            .find(filter)
            .populate("user", "first_name email last_name profile_image")
            .skip(skip)
            .limit(Number(limit))
            .lean(); // lean() returns plain JS object

        // -------------------------------
        // 📌 Attach challenge logs to each participant
        // -------------------------------
        const participantIds = participants.map(p => p._id);

        // Get logs for these participants
        const logs = await ChallengeLog.find({
            participant: { $in: participantIds }
        })
            .sort({ log_date: -1 })   // newest first
            .lean();

        // Attach logs to their participant
        participants.forEach(p => {
            p.logs = logs.filter(l => l.participant.toString() === p._id.toString());
        });

        // -------------------------------
        // 📌 Count total for pagination
        // -------------------------------
        const total = await ChallengeParticipant.countDocuments(filter);

        return res.json({
            success: 1,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                total_pages: Math.ceil(total / limit),
            },
            data: participants
        });

    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};


// 📌 ADD LOG
exports.addLog = async (req, res) => {
    try {
        const { challenge_id, value, note } = req.body;
        const user_id = req.user.role == "User" ? req.user._id : req.body.user;

        if (!user_id) {
            return res.status(500).json({ success: 0, message: "No user found" });
        }

        const participant = await ChallengeParticipant.findOne({
            challenge: challenge_id,
            user: user_id
        });

        if (!participant) {
            return res.status(400).json({ success: 0, message: "You are not part of this challenge" });
        }

        const findChallenge = await Challenge.findById(challenge_id);
        if (!findChallenge) {
            return res.status(500).json({ success: 0, message: "No challenge found" });
        }

        // -------------------------
        // 📌 Prepare Media Array
        // -------------------------
        const media = [];

        if (req.files && req.files.image) {
            req.files.image.forEach(img => {
                media.push({
                    url: img.path,
                    type: "image"
                });
            });
        }

        if (req.files && req.files.video) {
            req.files.video.forEach(vid => {
                media.push({
                    url: vid.path,
                    type: "video"
                });
            });
        }

        // -------------------------
        // 📌 Create Log
        // -------------------------
        const log = await ChallengeLog.create({
            challenge: challenge_id,
            participant: participant._id,
            user: user_id,
            value,
            unit: findChallenge.target_unit,
            note,
            log_date: new Date(),
            media   // <-- saving uploaded media here
        });

        // Update participant progress
        participant.progress_value += Number(value);
        participant.progress_unit = findChallenge.target_unit;
        await participant.save();

        return res.status(201).json({
            success: 1,
            message: "Log added",
            data: log
        });

    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};


// 📌 GET LOGS
exports.getLogs = async (req, res) => {
    try {
        const { challenge_id, user_id } = req.query;
        const filter = {};
        if (challenge_id) filter.challenge_id = challenge_id;
        if (user_id) filter.user_id = user_id;
        const logs = await ChallengeLog.find(filter).sort({ log_date: -1 });
        return res.json({ success: 1, data: logs });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📌 LEADERBOARD
exports.getLeaderboard = async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const leaderboard = await ChallengeParticipant.find({ challenge_id })
            .populate("user", "first_name profile_img")
            .sort({ total_progress: -1 })
            .limit(20);

        return res.json({ success: 1, data: leaderboard });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
