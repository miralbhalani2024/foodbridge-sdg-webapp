/**
 * Routes = URL + HTTP method  →  [middleware...]  →  controller
 * Middlewares run left to right: protect (logged in?) → authorize (right role?) → controller
 */
const express = require('express');
const c = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', c.getDonations);                                  // public: browse
router.get('/mine', protect, c.getMyDonations);                   // NOTE: must be above '/:id'
router.get('/:id', c.getDonation);                                // public: details

router.post('/', protect, authorize('donor'), c.createDonation);  // donor lists food
router.put('/:id', protect, authorize('donor'), c.updateDonation);
router.delete('/:id', protect, authorize('donor', 'admin'), c.deleteDonation);

router.patch('/:id/claim', protect, authorize('ngo'), c.claimDonation); // ngo claims
router.patch('/:id/pickup', protect, c.markPickedUp);                   // ngo or donor confirms

module.exports = router;
