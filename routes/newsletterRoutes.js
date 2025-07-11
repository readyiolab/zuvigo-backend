const express = require('express');
const router = express.Router();
const { subscribeNewsletter, unsubscribeNewsletter } = require('../controller/newsletterController');

router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

module.exports = router;