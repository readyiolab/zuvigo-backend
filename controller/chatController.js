const nodemailer = require('nodemailer');
const db = require('../config/db');

// Zuvigo content for training the chatbot
const ZUVIGO_CONTEXT = `
You are a helpful AI assistant for Zuvigo, a digital agency. Answer questions based on the following information:

**About Zuvigo:**
We Don't Just Build Websites. We Build What's Next.
From sleek websites to smart automation, we help founders and entrepreneurs build digital systems that scale their business.

**How We Build - Our Methodology:**
1. Strategy & Product: We define your vision, target audience, and build a roadmap that aligns with your business goals. (Market Research, User Personas, Product Roadmap)
2. Website & Platform: We design and develop stunning, high-performance websites and platforms that convert. (Custom Design, Development, Mobile-First)
3. Growth & Optimization: We implement strategies to drive traffic, improve conversions, and scale your business. (SEO & Analytics, A/B Testing, Performance)
4. Ongoing Support: We provide continuous support, updates, and improvements to keep your business growing. (24/7 Support, Regular Updates, Maintenance)

**Solutions - Build & Presence:**
- Custom Website Design: Stunning, mobile-responsive websites tailored to your brand
- CMS & Custom Dashboards
- Conversion Pages: Create funnels that turn visitors into booked calls and sales
- Google Business Profile: Boost local visibility

**Solutions - Automate & Scale:**
- AI Setup & Automation: Automate client interactions with intelligent systems for calls, chats, & scheduling
- Email Marketing Campaigns: Nurture leads with personalized, automated email sequences
- Reputation & Reviews: Build credibility with automated feedback and reputation management

**Solutions - Engage & Grow:**
- Social Media Management: Content creation & strategy, posting schedules & automation
- Custom Reels & Videos: Professional, shareable videos that drive attention & leads
- Content Growth Campaigns: Blog & newsletter systems, cross-channel publishing

**Solutions - Analytics & Insights:**
- Performance Analytics: Funnel performance, real-time KPI dashboards, conversion metrics
- Optimization Experiments: A/B testing, UX/UI impact measurement, behavior heatmaps
- Analytics Dashboards: Marketing ROI reporting, attribution & forecasting models

**Booking:**
If the user wants to book a call or consultation, ask for their name and email only. Be friendly and professional.

Keep responses concise, helpful, and focused on Zuvigo's services. If asked about pricing, suggest they book a call to discuss their specific needs.
`;

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Chat with AI
const chat = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        // Build messages array with context
        const messages = [
            { role: 'system', content: ZUVIGO_CONTEXT },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        // Call OpenRouter API
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://zuvigo.com',
                'X-Title': 'Zuvigo'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:', errorData);
            return res.status(500).json({ error: 'Failed to get AI response' });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        // Check if user wants to book
        const bookingIntent = detectBookingIntent(message);

        res.status(200).json({
            message: aiResponse,
            bookingIntent: bookingIntent
        });

    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Detect booking intent
const detectBookingIntent = (message) => {
    const bookingKeywords = [
        'book', 'schedule', 'call', 'consultation', 'meeting',
        'appointment', 'talk', 'discuss', 'connect', 'get started',
        'start a project', 'hire', 'work with you'
    ];
    const lowerMessage = message.toLowerCase();
    return bookingKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Handle booking submission
const submitBooking = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Save to database first
        let dbSaved = false;
        try {
            await db.insert('tbl_chatbot_bookings', {
                name,
                email,
                created_at: new Date()
            });
            dbSaved = true;
            console.log('Booking saved to database:', { name, email });
        } catch (dbError) {
            console.error('Database error:', dbError.message);
        }

        // Try to send email (optional)
        let emailSent = false;
        try {
            if (process.env.SMTP_USER && process.env.SMTP_PASS &&
                process.env.SMTP_USER !== 'your-email@gmail.com') {

                const transporter = createTransporter();

                const userMailOptions = {
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: 'Thanks for reaching out to Zuvigo! 🚀',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #7c3aed;">Hi ${name}!</h2>
                            <p>Thanks for your interest in working with Zuvigo. We've received your request and will be in touch within 24 hours.</p>
                            <p>In the meantime, feel free to explore our work at <a href="https://zuvigo.com" style="color: #7c3aed;">zuvigo.com</a>.</p>
                            <br>
                            <p>Best regards,<br><strong>The Zuvigo Team</strong></p>
                        </div>
                    `
                };

                await transporter.sendMail(userMailOptions);
                emailSent = true;
                console.log('Confirmation email sent to:', email);
            }
        } catch (emailError) {
            console.error('Email error (non-critical):', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Booking submitted successfully!' + (emailSent ? ' Check your email for confirmation.' : ''),
            dbSaved,
            emailSent
        });

    } catch (error) {
        console.error('Error in booking:', error);
        res.status(500).json({ error: 'Failed to process booking. Please try again.' });
    }
};

module.exports = { chat, submitBooking };
