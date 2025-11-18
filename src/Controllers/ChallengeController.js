const Challenge = require("../Models/Challenge");
const ChallengeLog = require("../Models/ChallengeLog");
const ChallengeParticipant = require("../Models/ChallengeParticipant");


// 📌 CREATE CHALLENGE
exports.createChallenge = async (req, res) => {
    try {
        const data = req.body;
        if (req.files.banner) {
            data['banner'] = req.files.banner.path;
        }
        return res.json({
            data: data,
            // banner: req.files?.banner,
            files: req.files
        })
        const challenge = await Challenge.create(data);
        return res.status(201).json({ success: 1, message: "Challenge created", data: challenge });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📌 UPDATE CHALLENGE
exports.updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge.findByIdAndUpdate(id, req.body, { new: true });
        if (!challenge) return res.status(404).json({ success: 0, message: "Challenge not found" });
        return res.json({ success: 1, message: "Challenge updated", data: challenge });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

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
        const { category, type, page = 1, limit = 10 } = req.query;
        const query = {};
        if (category) query.category = category;
        if (type) query.type = type;

        const challenges = await Challenge.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Challenge.countDocuments(query);

        return res.json({
            success: 1,
            data: challenges,
            pagination: { total, page: Number(page), limit: Number(limit) },
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};




exports.joinChallenge = async (req, res) => {
    try {
        const { challenge_id } = req.body;
        const user_id = req.user._id;

        const alreadyJoined = await ChallengeParticipant.findOne({ challenge: challenge_id, user: user_id });
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

// 📌 GET PARTICIPANTS
exports.getParticipants = async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const participants = await ChallengeParticipant.find({ challenge: challenge_id }).populate("user", "first_name email");
        return res.json({ success: 1, data: participants });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// 📌 ADD LOG
exports.addLog = async (req, res) => {
    try {
        const { challenge_id, value, unit, note } = req.body;
        const user_id = req.user._id;

        const participant = await ChallengeParticipant.findOne({ challenge: challenge_id, user: user_id });
        if (!participant) {
            return res.status(400).json({ success: 0, message: "You are not part of this challenge" });
        }

        const log = await ChallengeLog.create({
            challenge: challenge_id,
            participant: participant._id,
            user: user_id,
            value,
            unit,
            note,
            log_date: new Date(),
        });
        participant.total_progress += Number(value);
        await participant.save();
        return res.status(201).json({ success: 1, message: "Log added", data: log });
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
