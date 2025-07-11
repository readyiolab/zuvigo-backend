const db = require('../config/db');

const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate required field
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email already exists
        const existingSubscriber = await db.selectAll(
            'tbl_newsletter_subscribers',
            'email',
            'email = ?',
            [email]
        );

        if (existingSubscriber.length > 0) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Insert email into database
        const result = await db.insert('tbl_newsletter_subscribers', {
            email,
            subscription_date: new Date(),
            is_subscribed: true
        });

        res.status(201).json({
            message: 'Successfully subscribed to newsletter',
            id: result.insert_id
        });
    } catch (error) {
        console.error('Error processing subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const unsubscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate required field
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email exists
        const existingSubscriber = await db.selectAll(
            'tbl_newsletter_subscribers',
            'email',
            'email = ?',
            [email]
        );

        if (existingSubscriber.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Update subscription status
        await db.update(
            'tbl_newsletter_subscribers',
            { is_subscribed: false },
            'email = ?',
            [email]
        );

        res.status(200).json({
            message: 'Successfully unsubscribed from newsletter'
        });
    } catch (error) {
        console.error('Error processing unsubscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { subscribeNewsletter, unsubscribeNewsletter };
