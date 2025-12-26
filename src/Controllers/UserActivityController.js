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
            ...req.body,
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
    const { id, activity_date, activity_type } = req.query;
    const fdata = {};
    // await UserActivity.deleteMany({ user: "694e51f8026179d10df5ae72" });
    if (req.user?._id) {
        fdata.user = req.user._id;
    }

    if (id) {
        fdata._id = id;
    }

    if (activity_type) {
        fdata.activity_type = activity_type;
    }

    if (activity_date) {
        const dateObj = new Date(activity_date);
        if (!isNaN(dateObj)) {
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
        {
            $group: {
                _id: null,
                total_value: {
                    $sum: {
                        $convert: {
                            input: "$activity_value",
                            to: "int",
                            onError: 0,
                            onNull: 0
                        }
                    }
                }
            }
        }
    ]);

    const totalValue = totalResult[0]?.total_value || 0;

    return res.json({
        success: 1,
        message: "List of activity",
        data: resp,
        total: totalValue,
        unit: resp[0]?.activity_unit || null,
        fdata
    });
};

exports.user_dashboard = async (req, res) => {
    const { activity_date } = req.query;

    let match = {};

    // Filter by user
    if (req.user?._id) {
        match.user = req.user._id;
    }

    // Filter by date (full day)
    if (activity_date) {
        const dateObj = new Date(activity_date);
        if (!isNaN(dateObj)) {
            const nextDay = new Date(dateObj);
            nextDay.setDate(nextDay.getDate() + 1);

            match.activity_date = {
                $gte: dateObj,
                $lt: nextDay
            };
        }
    }

    const result = await UserActivity.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$activity_type",
                total_value: { $sum: { $toInt: "$activity_value" } },
                unit: { $first: "$activity_unit" }
            }
        }
    ]);

    // Convert array → object for easy frontend use
    const dashboard = {
        calories: 0,
        water: 0,
        walk: 0,
        sleep: 0
    };

    result.forEach(item => {
        dashboard[item._id] = {
            value: item.total_value,
            unit: item.unit
        };
    });

    return res.json({
        success: 1,
        message: "User dashboard data",
        data: dashboard
    });
};
