const { Router } = require("express");
const { send_otp, verify_otp, store_profile, user_list } = require("../src/Controllers/UserController");
const { Auth } = require("../src/middleware/Auth");

const router = Router();
router.post('/send-otp', send_otp);
router.get('/', Auth(), user_list);
router.post('/verify-otp', verify_otp);
router.post('/register', store_profile);
module.exports = router;