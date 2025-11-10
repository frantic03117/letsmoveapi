const { Router } = require("express");



const { get_setting, create_setting, delete_setting, update_setting, update_activation, getTypes } = require("../src/Controllers/SettingController");
const Store = require("../src/middleware/Store");
const { Auth } = require("../src/middleware/Auth");

const router = Router();
router.get('/', get_setting);
router.get('/setting-type', Auth, getTypes);
router.post('/', Store('image').single('file'), create_setting);
router.delete('/delete/:id', Auth, delete_setting);
router.put('/update/:id', Auth, Store('image').single('file'), update_setting);
router.put('/activation/:id', Auth, update_activation);
module.exports = router;