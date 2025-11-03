const { Router } = require("express");

const store = require("../middleware/Upload");
const { Auth } = require("../middleware/Auth");
const { get_setting, create_setting, delete_setting, update_setting, update_activation } = require("../src/Controllers/SettingController");

const router = Router();
router.get('/', get_setting);
router.get('/setting-type', Auth, getTypes);
router.post('/', Auth, store('image').single('file'), create_setting);
router.delete('/delete/:id', Auth, delete_setting);
router.put('/update/:id', Auth, store('image').single('file'), update_setting);
router.put('/activation/:id', Auth, update_activation);
module.exports = router;