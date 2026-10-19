const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const { sendResponse } = require('./utils/response');

const app = express();

// Izinkan request dari web Anda
app.use(cors({
  origin: [
    'https://ayakamotion-am.vercel.app',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  sendResponse(res, {
    success: true,
    http_code: 200,
    firebase_code: 'ok',
    message: 'Server is running',
  });
});

// Semua route API
app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  sendResponse(res, {
    success: false,
    http_code: 404,
    firebase_code: 'not-found',
    message: 'Endpoint tidak ditemukan',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  sendResponse(res, {
    success: false,
    http_code: 500,
    firebase_code: 'internal',
    message: 'Internal Server Error',
  });
});

module.exports = app;