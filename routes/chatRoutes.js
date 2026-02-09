const express = require('express');
const router = express.Router();
const { chat, submitBooking } = require('../controller/chatController');

// Chat endpoint
router.post('/chat', chat);

// Booking endpoint
router.post('/chat/book', submitBooking);

module.exports = router;
