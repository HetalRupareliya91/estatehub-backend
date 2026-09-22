const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../validators/authValidators');

const router = express.Router();

// 5 attempts per 15 minutes per IP, so a real user retrying a typo isn't
// blocked, but repeated automated guesses are slowed down significantly.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

router.post('/register', validate(registerValidator), register);
router.post('/login', loginLimiter, validate(loginValidator), login);
router.get('/me', protect, getMe);

module.exports = router;
