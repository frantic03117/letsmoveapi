const express = require("express");
const router = express.Router();
const {
    joinCommunity,
    leaveCommunity,
    getCommunityMembers,
    checkJoinStatus,
} = require("../controllers/communityJoin.controller");

router.post("/:id/join", joinCommunity);


router.post("/:id/leave", leaveCommunity);


router.get("/:id/members", getCommunityMembers);


router.get("/:id/join-status", checkJoinStatus);

module.exports = router;
