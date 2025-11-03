const { Router } = require("express");
const { _create, getall, delete_banner, update_banner } = require("../src/Controllers/BannerController");
const Store = require("../src/middleware/Store");

const router = Router();
router.post('/', Store('image').single('image'), _create);
router.get('/', getall);
router.put('/:id', Store('image').single('image'), update_banner);
router.delete('/:id', delete_banner);
module.exports = router;