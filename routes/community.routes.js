const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { getAllCommunities, createCommunity, updateCommunity, deleteCommunity, addComment, getComments, shareCommunity, toggleLike } = require("../src/Controllers/CommunityController");
const Store = require("../src/middleware/Store");
const { Auth } = require("../src/middleware/Auth");

router.get('/', getAllCommunities);
router.post('/', Store("any").any(), createCommunity);
router.put('/update/:id', updateCommunity);
router.delete('/delete/:id', deleteCommunity);
// Like/Unlike
router.post("/:id/like", Auth, toggleLike);

// Comment
router.post(
    "/:id/comment",
    [body("content").notEmpty().withMessage("Comment content is required")],
    addComment
);

// Get Comments + Replies
router.get("/:id/comments", getComments);

// Share
router.post("/:id/share", shareCommunity);

module.exports = router;
