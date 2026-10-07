const express = require('express');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/', getStats); // public impact dashboard data

module.exports = router;
