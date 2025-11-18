// routes/adminAuthRoutes.js
const express = require("express");
const { body } = require("express-validator");
const { validateRequest } = require("../src/middleware/validateRequest");
const { admin_auth_login } = require("../src/Controllers/AdminController");

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

module.exports = router;
