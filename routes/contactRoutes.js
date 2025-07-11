// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const  {submitContactForm}  = require('../controller/contactController');

router.post('/contact', submitContactForm);

module.exports = router;