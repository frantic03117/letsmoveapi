const EventModel = require("../Models/Event");
const EventJoin = require("../Models/EventJoin");
const path = require("path");
exports.createEvent = async (req, res) => {
    try {

        const fields = ['title', 'country', 'address', 'event_start_at', 'event_end_at', 'short_description', 'description'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.status(500).json({ success: 0, message: 'The following fields are required:', fields: emptyFields });
        }
        const data = { ...req.body };
        const files = (req.files || []).map((file, i) => ({
            url: `/uploads/${file.filename}`,
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
        data['files'] = files;
        const resp = await EventModel({ ...data })
        await resp.save();
        return res.status(201).json({
            success: 1,
            message: "Event post created successfully!",
            data: resp,
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}
exports.getEvents = async (req, res) => {
    try {
        const { id, category, search, page = 1, limit = 10, isJoinedByMe } = req.query;
        const filter = {};
        const userId = req.user._id;
        if (id) filter._id = id;
        if (category) filter.category = category;

        // Text search (title, country, description)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
                { short_description: { $regex: search, $options: "i" } },
            ];
        }
        let joinedEventIds = [];
        if (userId) {
            const joins = await EventJoin.find({ user: userId }).select("event");
            joinedEventIds = joins.map(j => String(j.event));

            if (isJoinedByMe != undefined) {
                if (isJoined === "true") {
                    // Only joined challenges
                    filter["_id"] = { $in: joinedEventIds };
                } else if (isJoined === "false") {
                    // Only not joined challenges
                    filter["_id"] = { $nin: joinedEventIds };
                }
            }
        }
        const skip = (Number(page) - 1) * Number(limit);

        const [events, total] = await Promise.all([
            EventModel.find(filter).populate("category").populate('country')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            EventModel.countDocuments(filter),
        ]);

        if (!events.length) {
            return res.status(404).json({
                success: 0,
                message: "No events found",
            });
        }



        let finalEvents = events.map(event => {
            const isJoined = joinedEventIds.includes(String(event._id));
            return {
                ...event.toObject(),
                isJoinedByMe: isJoined
            };
        });
        return res.status(200).json({
            success: 1,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
            data: finalEvents,
        });
    } catch (err) {
        console.error("Get Events Error:", err);
        return res.status(500).json({
            success: 0,
            message: err.message || "Internal server error",
        });
    }
};
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: 0, message: "Event ID is required." });
        }
        const existingEvent = await EventModel.findById(id);
        if (!existingEvent) {
            return res.status(404).json({ success: 0, message: "Event not found." });
        }
        const data = { ...req.body };
        const files = (req.files || []).map(file => ({
            url: `/uploads/${file.filename}`,
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
        if (files.length > 0) {
            data.files = [...(existingEvent.files || []), ...files];
        }
        const updatedEvent = await EventModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            success: 1,
            message: "Event updated successfully!",
            data: updatedEvent,
        });
    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message || "Internal server error",
        });
    }
};
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: 0, message: "Event ID is required." });
        }
        await EventModel.findByIdAndDelete(id);
        return res.status(200).json({
            success: 1,
            message: "Event deleted successfully!",
            data: [],
        });
    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message || "Internal server error",
        });
    }
}
exports.joinEvent = async (req, res) => {
    try {
        const { id } = req.params; // community ID
        const userId = req.user._id;
        const exists = await EventJoin.findOne({ event: id, user: userId });
        if (exists) {
            return res.status(400).json({ success: 0, message: "Already joined this event" });
        }
        const join = await EventJoin.create({ event: id, user: userId });
        await EventModel.findByIdAndUpdate(id, { $inc: { members_count: 1 } }, { new: true });
        return res.status(201).json({
            success: 1,
            message: "Event  joined successfully",
            data: join,
        });
    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: err.message || "Internal server error",
        });
    }
}
exports.leaveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const join = await EventJoin.findOneAndDelete({ event: id, user: userId });

        if (!join) {
            return res.status(404).json({ success: 0, message: "You are not a member of this community" });
        }

        await EventModel.findByIdAndUpdate(id, { $inc: { members_count: -1 } });

        return res.status(200).json({
            success: 1,
            message: "🚪 Left event successfully",
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}
exports.getEventMembers = async (req, res) => {
    try {
        const { id } = req.query; // community ID
        const { page = 1, limit = 20 } = req.query;
        let fdata = {};
        if (id) {
            fdata['event'] = id;
        }
        const total = await EventJoin.countDocuments(fdata);

        const members = await EventJoin.find(fdata)
            .populate("user", "first_name email profile_image")
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
exports.checkJoinStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const join = await EventJoin.findOne({ event: id, user: userId });

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