import { body } from "express-validator";

export const createMatadataValidation = [
    body('name').notEmpty().withMessage('name is required'),
    body('type').notEmpty().withMessage('name is required'),
];