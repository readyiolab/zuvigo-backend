const express = require('express');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ['http://localhost:5176', 'https://zuvigo.com', 'https://www.zuvigo.com'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., non-browser clients like cURL)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin || '*'); // Return the specific origin or '*' for non-browser clients
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers used in the request
    credentials: true
}));

// Routes
app.use('/api', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api', bookRoutes);

// Error handling middleware to catch CORS errors gracefully
app.use((err, req, res, next) => {
    console.error(err.message);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy: This origin is not allowed' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});