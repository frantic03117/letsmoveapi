const { Router } = require("express");
const { getWorkouts, createWorkout, updateWorkout, deleteWorkout } = require("../src/Controllers/WorkoutController");
const { Auth } = require("../src/middleware/Auth");
const Store = require("../src/middleware/Store");

const router = Router();
router.get('/', getWorkouts);
router.post('/', Auth('Admin'), Store('image').fields([
    {
        name: "banner",
        maxCount : 1
    }
]), createWorkout);
router.put('/update/:id', Auth('Admin'), Store('image').fields([
    {
        name: "banner",
        maxCount : 1
    }
]), updateWorkout);
router.delete('/delete/:id', Auth('Admin'), deleteWorkout);
module.exports = router;