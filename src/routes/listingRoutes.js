const express = require('express');
const {
  getListings, getListingById, createListing, updateListing, deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);

router.use(protect);
router.post('/', createListing);
router.patch('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
