const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const { createChallenge, updateChallenge, deleteChallenge, getChallenges, joinChallenge, addLog, getLogs, getLeaderboard } = require("../src/Controllers/ChallengeController");

const router = Router();
// Admin-only actions
router.post("/", Auth("Admin"), createChallenge);
router.put("/:id", Auth("Admin"), updateChallenge);
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
