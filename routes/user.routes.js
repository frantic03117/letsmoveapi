const { Router } = require("express");
const { send_otp, verify_otp, store_profile } = require("../src/Controllers/UserController");

const router = Router();
router.post('/send-otp', send_otp);
router.post('/verify-otp', verify_otp);
router.post('/register', store_profile);
module.exports = router;