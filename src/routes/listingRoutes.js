const express = require('express');
const {
  getListings, getListingById, createListing, updateListing, deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createListingValidator, updateListingValidator } = require('../validators/listingValidators');

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);

router.use(protect);
router.post('/', validate(createListingValidator), createListing);
router.patch('/:id', validate(updateListingValidator), updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
