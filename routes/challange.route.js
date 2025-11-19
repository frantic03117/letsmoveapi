const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const { createChallenge, updateChallenge, deleteChallenge, getChallenges, joinChallenge, addLog, getLogs, getLeaderboard } = require("../src/Controllers/ChallengeController");
const Store = require("../src/middleware/Store");

const router = Router();
// Admin-only actions
router.post("/", Store('any').fields([
    {
        name: "banner", maxCount: 1
    },
    {
        name: "media", maxCount: 10
    }
]), createChallenge);
router.put("/update/:id", Auth("Admin"), Store('any').fields([
    {
        name: "banner", maxCount: 1
    },
    {
        name: "media", maxCount: 10
    }
]), updateChallenge);
router.delete("/:id", Auth("Admin"), deleteChallenge);

//  Everyone can view challenges
router.get("/", Auth("Admin", "Trainer", "User"), getChallenges);


//  User actions
router.post("/join", Auth("User"), joinChallenge);
router.post("/log", Auth("User"), addLog);
router.get("/log", Auth("User", "Admin"), getLogs);

//  Leaderboard
router.get("/:challenge_id/leaderboard", Auth("User", "Admin"), getLeaderboard);

module.exports = router;
