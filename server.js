require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default_secret_key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions',
        }),
        cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1-hour session
    })
);

// Routes
app.use('/auth', authRoutes);

// Error Handling Middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message || 'Something went wrong',
    });
});

// Connect to MongoDB and Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });