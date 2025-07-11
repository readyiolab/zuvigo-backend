const express = require('express');
const router = express.Router();
const { submitBookingForm } = require('../controller/bookController');

router.post('/book', submitBookingForm);

module.exports = router;