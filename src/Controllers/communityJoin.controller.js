const Community = require("../Models/Community");
const CommunityJoin = require("../Models/CommunityJoin");

/**
 * 🟢 Join a community
 */
exports.joinCommunity = async (req, res) => {
    try {
        const { id } = req.params; // community ID
        const userId = req.user._id;

        const exists = await CommunityJoin.findOne({ community: id, user: userId });
        if (exists) {
            return res.status(400).json({ success: 0, message: "Already joined this community" });
        }

        const join = await CommunityJoin.create({ community: id, user: userId });
        await Community.findByIdAndUpdate(id, { $inc: { members_count: 1 } }, { new: true });

        return res.status(201).json({
            success: 1,
            message: "✅ Joined community successfully",
            data: join,
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

/**
 * 🔴 Leave a community
 */
exports.leaveCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const join = await CommunityJoin.findOneAndDelete({ community: id, user: userId });

        if (!join) {
            return res.status(404).json({ success: 0, message: "You are not a member of this community" });
        }

        await Community.findByIdAndUpdate(id, { $inc: { members_count: -1 } });

        return res.status(200).json({
            success: 1,
            message: "🚪 Left community successfully",
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

/**
 * 👥 Get all members of a community
 */
exports.getCommunityMembers = async (req, res) => {
    try {
        const { id } = req.params; // community ID
        const { page = 1, limit = 20 } = req.query;

        const total = await CommunityJoin.countDocuments({ community: id });

        const members = await CommunityJoin.find({ community: id })
            .populate("user", "name email avatar")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            success: 1,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: members.map((m) => ({
                user: m.user,
                role: m.role,
                joinedAt: m.createdAt,
            })),
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};

/**
 * 🧩 Check if current user has joined a specific community
 */
exports.checkJoinStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const join = await CommunityJoin.findOne({ community: id, user: userId });

        return res.status(200).json({
            success: 1,
            joined: !!join,
            role: join?.role || null,
            joinedAt: join?.createdAt || null,
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
};
