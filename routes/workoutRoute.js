const { Router } = require("express");
const { getWorkouts, createWorkout } = require("../src/Controllers/WorkoutController");
const { Auth } = require("../src/middleware/Auth");

const router = Router();
router.get('/', getWorkouts);
router.post('/', Auth('Admin'), createWorkout);
module.exports = router;