const { validationResult } = require("express-validator");
const Matadata = require("../models/Matadata");
const fs = require('fs');
const path = require('path');
const Country = require("../Models/Country");
exports.importMatadata = async (req, res) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        // Fetch data from API
        const response = await fetch('https://localhost:7887/api/v1/setting/matadata', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        const data = await response.json();
        // return res.json({ data: data.data })


        const items = data.data;

        let importedCount = 0;

        // Upsert (update if exists, insert if not)
        for (const item of items) {
            await Matadata.updateOne(
                { _id: item._id }, // match by _id from API
                { $set: item },    // update fields
                { upsert: true }   // create if not exists
            );
            importedCount++;
        }

        res.status(200).json({
            success: true,
            message: `Metadata import completed. ${importedCount} record(s) processed.`,
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.createMatadata = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ success: 0, message: errors.array()[0].msg })
        }
        const data = req.body;
        const rsp = await Matadata.create(data);
        return res.json({ success: 1, message: "Created successfully", data: rsp })
    } catch (err) {
        res.status(500).json({ success: 0, message: err.message });
    }
}
exports.deleteMatadata = async (req, res) => {
    try {
        const matatdata = await Matadata.findByIdAndDelete(req.params.id);
        if (!matatdata) return res.status(404).json({ error: "Matatdata not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
    }
}
exports.updateMatadata = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const matatdata = await Matadata.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!matatdata) return res.status(404).json({ error: "Matatdata not found" });
        res.status(200).json({ message: "Updated successfully", data: matatdata });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
}
exports.getAllMatadata = async (req, res) => {
    try {
        // await Matadata.deleteMany()
        const matadatas = await Matadata.find();

        // Convert documents to plain JS objects for modification
        const result = await Promise.all(
            matadatas.map(async (meta) => {
                const metaObj = meta.toObject();
                if (metaObj?.name?.toLowerCase() === "country") {
                    const countries = await Country.find({}, "name code dial_code flag_image").sort({ name: 1 }).lean();
                    metaObj.options = countries.map((c) => ({
                        label: c.name,
                        value: c.code,
                        dial_code: c.dial_code,
                        flag_image: c.flag_image || "https://flagcdn.com/" + c.code.toLowerCase() + ".svg"
                    }));
                }

                return metaObj;
            })
        );

        res.status(200).json({ data: result, success: 1 });
    } catch (err) {
        console.error("Error fetching metadata:", err);
        res.status(500).json({ message: err.message, success: 0 });
    }
};

exports.saveCountry = async (req, res) => {
    // const filePath = path.join(__dirname, "./country.json");
    // const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    // await Country.insertMany(data);

    return res.json({ success: 1, message: "ok" })
}
exports.getCountry = async (req, res) => {
    try {
        const { keyword } = req.query;
        let filter = {};
        if (keyword && keyword.trim() !== '') {
            const search = keyword.trim();
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { code: { $regex: search, $options: 'i' } },
                    { dial_code: { $regex: search, $options: 'i' } },
                    { currency: { $regex: search, $options: 'i' } },
                    { continent: { $regex: search, $options: 'i' } },
                ]
            };
        }
        const countries = await Country.find(filter).sort({ name: 1 });
        return res.status(200).json({
            success: true,
            count: countries.length,
            data: countries
        });

    } catch (error) {
        console.error('Error fetching countries:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
