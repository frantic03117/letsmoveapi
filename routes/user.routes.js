const { Router } = require("express");
const { send_otp, verify_otp, store_profile, user_list, update_profile } = require("../src/Controllers/UserController");
const { Auth } = require("../src/middleware/Auth");
const Store = require("../src/middleware/Store");

const router = Router();
router.post('/send-otp', send_otp);
router.get('/', Auth(), user_list);
router.post('/verify-otp', verify_otp);
router.post('/register', store_profile);
router.put('/update', Auth(), Store('image').fields([
    {
        name: "profile_image", maxCount: 1
    }
]), update_profile);
module.exports = router;