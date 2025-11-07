const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    toggleLike,
    addComment,
    getComments,
    shareCommunity,
} = require("../controllers/communitySocial.controller");

// Like/Unlike
router.post("/:id/like", toggleLike);

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
