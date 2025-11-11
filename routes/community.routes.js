const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { getAllCommunities, createCommunity, updateCommunity, deleteCommunity, addComment, getComments, shareCommunity, toggleLike } = require("../src/Controllers/CommunityController");
const Store = require("../src/middleware/Store");
const { Auth } = require("../src/middleware/Auth");
const { joinCommunity, leaveCommunity, getCommunityMembers, checkJoinStatus } = require("../src/Controllers/communityJoin.controller");

router.get('/', getAllCommunities);
router.post('/', Store("any").any(), createCommunity);
router.put('/update/:id', updateCommunity);
router.delete('/delete/:id', deleteCommunity);
// Like/Unlike
router.post("/:id/like", Auth, toggleLike);

// Comment
router.post(
    "/:id/comment", Auth,
    [body("content").notEmpty().withMessage("Comment content is required")],
    addComment
);

// Get Comments + Replies
router.get("/:id/comment", getComments);

// Share
router.post("/:id/share", shareCommunity);


//join
router.post('/:id/join', Auth, joinCommunity);


//leave 
router.post('/:id/leave', Auth, leaveCommunity);

//all members

router.get('/members', Auth, getCommunityMembers);
router.get('/:id/status', Auth, checkJoinStatus);

module.exports = router;
