const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { getAllCommunities, createCommunity, updateCommunity, deleteCommunity, addComment, getComments, shareCommunity, toggleLike } = require("../src/Controllers/CommunityController");
const Store = require("../src/middleware/Store");
const { Auth } = require("../src/middleware/Auth");
const { joinCommunity, leaveCommunity, getCommunityMembers, checkJoinStatus } = require("../src/Controllers/communityJoin.controller");

router.get('/', getAllCommunities);
router.post('/', Auth('Admin', 'Employee', 'SubAdmin'), Store("any").any(), createCommunity);
router.put('/update/:id', Auth('Admin', 'Employee', 'SubAdmin'), updateCommunity);
router.delete('/delete/:id', Auth('Admin', 'Employee', 'SubAdmin'), deleteCommunity);
// Like/Unlike
router.post("/:id/like", Auth('User'), toggleLike);

// Comment
router.post(
    "/:id/comment", Auth('User'),
    [body("content").notEmpty().withMessage("Comment content is required")],
    addComment
);

// Get Comments + Replies
router.get("/:id/comment", Auth('User'), getComments);

// Share
router.post("/:id/share", Auth('User'), shareCommunity);


//join
router.post('/:id/join', Auth('User'), joinCommunity);


//leave 
router.post('/:id/leave', Auth('User'), leaveCommunity);

//all members

router.get('/members', Auth('User'), getCommunityMembers);
router.get('/:id/status', Auth('User'), checkJoinStatus);

module.exports = router;
