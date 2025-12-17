// routes/adminAuthRoutes.js
const express = require("express");
const { body } = require("express-validator");
const { validateRequest } = require("../src/middleware/validateRequest");
const { admin_auth_login, notificationList } = require("../src/Controllers/AdminController");
const { Auth } = require("../src/middleware/Auth");

const router = express.Router();

router.post(
    "/admin/auth",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validateRequest,
    admin_auth_login
);
router.get('/notification-list', Auth('User'), notificationList)

module.exports = router;
