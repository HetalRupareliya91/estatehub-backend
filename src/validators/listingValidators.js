const { body } = require('express-validator');

const TYPES = ['house', 'apartment', 'condo', 'land', 'commercial'];
const STATUSES = ['available', 'under_offer', 'sold', 'rented', 'off_market'];

const createListingValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('price').notEmpty().withMessage('Price is required')
    .bail().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('propertyType').optional({ checkFalsy: true }).isIn(TYPES).withMessage(`Property type must be one of: ${TYPES.join(', ')}`),
  body('status').optional({ checkFalsy: true }).isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('bedrooms').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Bedrooms must be a positive whole number'),
  body('bathrooms').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Bathrooms must be a positive number'),
  body('areaSqft').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Area must be a positive whole number'),
];

// Same rules, but every field is optional since a PATCH may touch only one of them.
const updateListingValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('propertyType').optional({ checkFalsy: true }).isIn(TYPES).withMessage(`Property type must be one of: ${TYPES.join(', ')}`),
  body('status').optional({ checkFalsy: true }).isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('bedrooms').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Bedrooms must be a positive whole number'),
  body('bathrooms').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Bathrooms must be a positive number'),
  body('areaSqft').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Area must be a positive whole number'),
];

module.exports = { createListingValidator, updateListingValidator };
