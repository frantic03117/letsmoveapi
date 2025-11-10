const { Router } = require("express");
const { getAllMatadata, createMatadata, getCountry } = require("../src/Controllers/MatadataController");

const router = Router();
router.get('/', getAllMatadata);
router.post('/', createMatadata);
router.get('/country', getCountry);
module.exports = router;