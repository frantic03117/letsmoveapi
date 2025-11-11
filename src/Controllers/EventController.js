const EventModel = require("../Models/Event");

exports.createEvent = async (req, res) => {
    try {

        const fields = ['title', 'country', 'address', 'event_start_at', 'event_end_at', 'short_description', 'description'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, errors: 'The following fields are required:', fields: emptyFields });
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
        const { id, category, search, page = 1, limit = 10 } = req.query;
        const filter = {};

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

        const skip = (Number(page) - 1) * Number(limit);

        const [events, total] = await Promise.all([
            EventModel.find(filter)
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

        return res.status(200).json({
            success: 1,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
            data: events,
        });
    } catch (err) {
        console.error("Get Events Error:", err);
        return res.status(500).json({
            success: 0,
            message: err.message || "Internal server error",
        });
    }
};