const { Router } = require("express");
const { getAllMatadata, createMatadata, getCountry, updateMatadata } = require("../src/Controllers/MatadataController");

const router = Router();
router.get('/', getAllMatadata);
router.post('/', createMatadata);
router.post('/update/:id', updateMatadata);
router.get('/country', getCountry);
module.exports = router;