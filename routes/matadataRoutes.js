const { Router } = require("express");
const { getAllMatadata, createMatadata, saveCountry, getCountry } = require("../src/Controllers/MatadataController");

const router = Router();

router.get('/', getAllMatadata);
router.post('/', createMatadata);
// router.post('/country', saveCountry);
router.get('/country', getCountry);

module.exports = router;