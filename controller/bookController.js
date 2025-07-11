// controllers/bookController.js
const db = require('../config/db');

const submitBookingForm = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            company,
            jobTitle,
            serviceInterest,
            preferredDate,
            preferredTime,
            howDidYouHear,
            message
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !company || !serviceInterest || !preferredDate || !preferredTime) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate phone format (basic validation, adjust as needed)
        const phoneRegex = /^\+\d{1,3}\s?\(\d{3}\)\s?\d{3}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format. Use: +1 (555) 123-4567' });
        }

        // Validate serviceInterest
        const validServices = [
            'Digital Marketing Strategy',
            'Social Media Management',
            'SEO & Content Marketing',
            'Paid Advertising (Google/Facebook)',
            'Website Development',
            'Brand Identity & Design',
            'Marketing Analytics',
            'Other'
        ];
        if (!validServices.includes(serviceInterest)) {
            return res.status(400).json({ error: 'Invalid service selected' });
        }

        // Validate preferredDate (ensure it's a valid date and not in the past)
        const today = new Date().toISOString().split('T')[0];
        if (preferredDate < today) {
            return res.status(400).json({ error: 'Preferred date cannot be in the past' });
        }

        // Validate preferredTime
        const validTimes = [
            '9:00 AM - 10:00 AM',
            '10:00 AM - 11:00 AM',
            '11:00 AM - 12:00 PM',
            '2:00 PM - 3:00 PM',
            '3:00 PM - 4:00 PM',
            '4:00 PM - 5:00 PM'
        ];
        if (!validTimes.includes(preferredTime)) {
            return res.status(400).json({ error: 'Invalid time slot selected' });
        }

        // Validate howDidYouHear (optional field, but if provided, must be valid)
        const validSources = ['Google Search', 'Social Media', 'Referral', 'LinkedIn', 'Advertisement', 'Other', ''];
        if (howDidYouHear && !validSources.includes(howDidYouHear)) {
            return res.status(400).json({ error: 'Invalid source selected' });
        }

        // Insert form data into database
        const result = await db.insert('tbl_booking_requests', {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            company,
            job_title: jobTitle,
            service_interest: serviceInterest,
            preferred_date: preferredDate,
            preferred_time: preferredTime,
            how_did_you_hear: howDidYouHear,
            message
        });

        res.status(201).json({
            message: 'Booking request submitted successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error processing booking form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitBookingForm };