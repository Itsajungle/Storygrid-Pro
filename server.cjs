const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint - MUST be before static files
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Story Grid Pro',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

