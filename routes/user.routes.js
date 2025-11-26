const { Router } = require("express");
const { send_otp, verify_otp, store_profile, user_list, update_profile, calculate_bmi } = require("../src/Controllers/UserController");
const { Auth } = require("../src/middleware/Auth");
const Store = require("../src/middleware/Store");

const router = Router();
router.post('/send-otp', send_otp);
router.get('/', Auth(), user_list);
router.post('/verify-otp', verify_otp);
router.post('/register', Store('image').fields([
    {
        name: "profile_image", maxCount: 1
    }
]), store_profile);
router.post('/calculate-bmi', calculate_bmi);
router.put('/update', Auth(), Store('image').fields([
    {
        name: "profile_image", maxCount: 1
    }
]), update_profile);
module.exports = router;