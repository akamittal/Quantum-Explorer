/**
 * Quantum Explorer Backend Analytical Engine Core
 * Path: /backend/server.js
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize configuration environments
dotenv.config();

const app = express();
// Default to internal port 3000 if no environmental variable overrides are specified
const PORT = process.env.PORT || 3000;

// Enable strict Cross-Origin Resource Sharing (CORS) rules for our local frontend endpoint
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Express built-in JSON parsing middleware transformer
app.use(express.json());

/**
 * Baseline System Health-Check Route
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        engine: 'Node.js/Express Complex Math Hub'
    });
});

/**
 * Global centralized error management middleware catch-block
 */
app.use((err, req, res, next) => {
    console.error('CRITICAL BACKEND EXCEPTION:', err.stack);
    res.status(500).json({
        error: 'Internal System Anomaly',
        message: err.message || 'An unhandled mathematical or structural error occurred.'
    });
});

// Boot the network listening matrix hook
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 QUANTUM APPS CORE ACTIVE ON: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
