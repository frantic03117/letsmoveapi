const { Router } = require("express");
const Store = require("../src/middleware/Store");
const { createMeal, getMeals, updateMeal, deleteMeal } = require("../src/Controllers/MealController");

const router = Router();
router.post('/', Store('any').fields([
    {
        name: "banner", maxCount: 1
    },
    {
        name: "media", maxCount: 10
    }
]), createMeal);
router.get('/', getMeals);
router.put('/update/:id', Store('any').fields([
    {
        name: "banner", maxCount: 1
    },
    {
        name: "media", maxCount: 10
    }
]), updateMeal);
router.delete('/delete/:id', deleteMeal);
module.exports = router;