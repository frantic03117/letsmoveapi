const { Router } = require("express");
const { getAll, _create, destroy, updatefaq } = require("../src/Controllers/FaqController");
const { Auth } = require("../src/middleware/Auth");

const router = Router();
router.get('/', getAll);
router.post('/', Auth('Admin'), _create);
router.delete('/delete/:id', Auth('Admin'), destroy);
router.put('/update/:id', Auth('Admin'), updatefaq);
module.exports = router;