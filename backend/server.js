/**
 * Quantum Explorer Backend Analytical Engine Core
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executeWithQiskit } from './qiskitClient.js';
import { generateTutorReply } from './aiTutor.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    engine: 'Node.js/Express Complex Math Hub'
  });
});

app.get('/api/qiskit/health', async (req, res) => {
  const baseUrl = (process.env.QISKIT_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  try {
    const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await response.json();
    res.status(response.ok ? 200 : 502).json(data);
  } catch {
    res.status(503).json({ status: 'unavailable', engine: 'Qiskit + Aer' });
  }
});

const aiRequestBuckets = new Map();
app.use('/api/ai/chat', (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const bucket = aiRequestBuckets.get(key) || { startedAt: now, count: 0 };
  if (now - bucket.startedAt >= 60_000) {
    bucket.startedAt = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  aiRequestBuckets.set(key, bucket);
  if (aiRequestBuckets.size > 2000) {
    for (const [ip, value] of aiRequestBuckets) {
      if (now - value.startedAt >= 60_000) aiRequestBuckets.delete(ip);
    }
  }
  if (bucket.count > 20) {
    return res.status(429).json({ error: 'AI tutor rate limit', message: 'Please wait a minute before asking more questions.' });
  }
  next();
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const result = await generateTutorReply(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 502).json({
      error: 'AI tutor request failed',
      message: error.message || 'The AI tutor could not complete this request.'
    });
  }
});

app.post('/api/qiskit/execute', async (req, res, next) => {
  try {
    const result = await executeWithQiskit(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: 'Qiskit execution failed', message: error.message });
    }
    error.status = 503;
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error('BACKEND EXCEPTION:', err.stack || err);
  res.status(err.status || 500).json({
    error: 'Internal System Anomaly',
    message: err.message || 'An unhandled mathematical or structural error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`QUANTUM EXPLORER BACKEND ACTIVE ON PORT ${PORT}`);
});
