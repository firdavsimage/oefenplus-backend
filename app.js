// backend/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes

app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/converter', require('./routes/converter'));
app.use('/api/translate', require('./routes/translate'));

// Default route (optional)
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is working ✅' });
});

// Start server
app.listen(PORT, () => {
  console.log(🚀 Server is running on port ${PORT});
});
