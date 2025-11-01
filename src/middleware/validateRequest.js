// middlewares/validateRequest.js
import { validationResult } from "express-validator";

/**
 * Global validation middleware
 * Handles validation errors from express-validator
 * Works for body, params, and query validations
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format the errors
        const formattedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            location: err.location,
        }));

        // Return only the first message (optional, but cleaner)
        const firstError = formattedErrors[0]?.message;

        return res.status(400).json({
            success: 0,
            error: {
                message: firstError.message,
                field: firstError.field,
                location: firstError.location,
            },
            message: firstError,
        });
    }

    next();
};
