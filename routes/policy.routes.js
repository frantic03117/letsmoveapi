const { Router } = require("express");
const { get_policies, _create } = require("../src/Controllers/PolicyController");
const { Auth } = require("../src/middleware/Auth");

const router = Router();
router.get('/', get_policies)
router.post('/', Auth('Admin', 'SubAdmin'), _create);
module.exports = router;