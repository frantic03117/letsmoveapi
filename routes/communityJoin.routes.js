const express = require("express");
const router = express.Router();
const {
    joinCommunity,
    leaveCommunity,
    getCommunityMembers,
    checkJoinStatus,
} = require("../controllers/communityJoin.controller");

// 🟢 Join a community
router.post("/:id/join", joinCommunity);

// 🔴 Leave a community
router.post("/:id/leave", leaveCommunity);

// 👥 Get members list
router.get("/:id/members", getCommunityMembers);

// 🔍 Check if user is a member
router.get("/:id/join-status", checkJoinStatus);

module.exports = router;
