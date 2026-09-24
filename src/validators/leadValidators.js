const { body } = require('express-validator');

const STAGES = ['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'];
const SOURCES = ['website', 'referral', 'walk_in', 'phone', 'social_media', 'other'];
const INTERESTS = ['buy', 'sell', 'rent'];

const createLeadValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is not valid').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('any').withMessage('Phone number is not valid'),
  body('source').optional({ checkFalsy: true }).isIn(SOURCES).withMessage(`Source must be one of: ${SOURCES.join(', ')}`),
  body('interestType').optional({ checkFalsy: true }).isIn(INTERESTS).withMessage(`Interest must be one of: ${INTERESTS.join(', ')}`),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
];

// Same rules, but every field is optional since a PATCH may touch only one of them.
// Also allows "stage", which only appears on update (never set on create).
const updateLeadValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is not valid').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('any').withMessage('Phone number is not valid'),
  body('source').optional({ checkFalsy: true }).isIn(SOURCES).withMessage(`Source must be one of: ${SOURCES.join(', ')}`),
  body('stage').optional({ checkFalsy: true }).isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(', ')}`),
  body('interestType').optional({ checkFalsy: true }).isIn(INTERESTS).withMessage(`Interest must be one of: ${INTERESTS.join(', ')}`),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
];

module.exports = { createLeadValidator, updateLeadValidator };
