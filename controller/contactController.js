// controllers/contactController.js
const db = require('../config/db');

const submitContactForm = async (req, res) => {
    try {
        const { name, email, country, profession, message } = req.body;

        // Validate required fields
        if (!name || !email || !profession || !message) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate profession
        const validProfessions = [
            'general-physician', 'dentist', 'psychologist', 'therapist',
            'nutritionist', 'wellness-coach', 'chiropractor', 'other'
        ];
        if (!validProfessions.includes(profession)) {
            return res.status(400).json({ error: 'Invalid profession selected' });
        }

        // Insert form data into database using Database class
        const result = await db.insert('tbl_contact_messages', {
            name,
            email,
            country,
            profession,
            message
        });

        res.status(201).json({
            message: 'Form submitted successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitContactForm };