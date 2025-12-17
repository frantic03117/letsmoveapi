const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const { getGoals, createGoal, updateGoal, deleteGoal } = require("../src/Controllers/dailyGoal.controller");

const router = Router();
router.get('/', Auth('User'), getGoals);
router.post('/', Auth('User'), createGoal);
router.put('/update/:id', Auth('User'), updateGoal);
router.delete('/delete/:id', Auth('User'), deleteGoal);
module.exports = router;