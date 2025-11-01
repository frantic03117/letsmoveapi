const { Router } = require("express");
const { getAllMatadata, createMatadata } = require("../src/Controllers/MatadataController");

const router = Router();

router.get('/', getAllMatadata);
router.post('/', createMatadata);

module.exports = router;