// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static HTML from the "public" folder
app.use(express.static('public'));

// /random endpoint - generates and appends a 4-digit number
app.get('/random', (req, res) => {
  const number = Math.floor(1000 + Math.random() * 9000);

  const logLine = number + '\n';
  fs.appendFile('numbers.txt', logLine, (err) => {
    if (err) {
      console.error('Failed to write to numbers.txt:', err);
      return res.status(500).json({ error: 'Failed to save number' });
    }

    res.json({ number });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
