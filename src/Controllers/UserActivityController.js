const UserActivity = require("../Models/UserActivity");

exports.createActivity = async (req, res) => {
    try {
        const user_id = req.user._id;
        const activity_type = req.body.activity_type;
        const fields = ['activity_type', 'activity_value', 'activity_unit', 'activity_date'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, errors: 'The following fields are required:', fields: emptyFields });
        }
        if (!activity_type) {
            return res.status(500).json({ success: 0, message: "Activity type is required" });
        }
        const accepted_types = [
            'calories', 'water', 'walk', 'sleep'
        ];
        if (!accepted_types.includes(activity_type)) {
            return res.status(500).json({ success: 0, message: "Activity type is required" + accepted_types.join(',') });
        }
        const data = {
            user: user_id,
            activity_type: activity_type,
            activity_value: req.body.activity_value,
            activity_unit: req.body.activity_unit,
            activity_date: req.body.activity_date
        }
        const uactivity = new UserActivity(data);
        await uactivity.save();
        return res.status(201).json({ success: 1, message: "User activity created successfully" });

    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}
exports.getActivity = async (req, res) => {
    // await UserActivity.deleteMany({})
    const { id, activity_date, activity_type } = req.query;
    const fdata = {};

    // If you store user reference
    if (req.user?._id) {
        fdata.user = req.user._id;
    }

    // Filter by activity id
    if (id) {
        fdata._id = id;
    }

    // Filter by activity type
    if (activity_type) {
        fdata.activity_type = activity_type;
    }

    // Filter by date (convert to actual Date object)
    if (activity_date) {
        const dateObj = new Date(activity_date);

        if (!isNaN(dateObj)) {
            // Query for the full day (00:00 → 23:59)
            const nextDay = new Date(dateObj);
            nextDay.setDate(nextDay.getDate() + 1);

            fdata.activity_date = {
                $gte: dateObj,
                $lt: nextDay
            };
        }
    }

    const resp = await UserActivity.find(fdata).sort({ activity_date: -1 });
    const totalResult = await UserActivity.aggregate([
        { $match: fdata },
        { $group: { _id: null, total_value: { $sum: { $toInt: "$activity_value" } } } }
    ]);

    const totalValue = totalResult[0]?.total_value || 0;


    return res.json({
        success: 1,
        message: "List of activity",
        data: resp,
        total: totalValue,
        unit: resp[0].activity_unit
    });


}
