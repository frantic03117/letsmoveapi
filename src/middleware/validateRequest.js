// middlewares/validateRequest.js
const { validationResult } = require("express-validator");

/**
 * Global validation middleware
 * Handles validation errors from express-validator
 * Works for body, params, and query validations
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors
        const formattedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            location: err.location,
        }));

        const firstError = formattedErrors[0];

        return res.status(400).json({
            success: 0,
            error: {
                message: firstError.message,
                field: firstError.field,
                location: firstError.location,
            },
            message: firstError.message,
        });
    }

    next();
};

module.exports = { validateRequest };
