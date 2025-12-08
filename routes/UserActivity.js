const { Router } = require("express");
const { getActivity, createActivity } = require("../src/Controllers/UserActivityController");
const { Auth } = require("../src/middleware/Auth");

const router = Router();
router.get('/', getActivity);
router.post('/', Auth(), createActivity);
module.exports = router;