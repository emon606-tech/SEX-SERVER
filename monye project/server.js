const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS and JSON parsing
app.use(express.json());
app.use(require('cors')());

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://missionpay-78730-default-rtdb.firebaseio.com/'
  });
} catch (err) {
  console.error("Firebase init error:", err);
  process.exit(1);
}

// Simple root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Utility to generate a random 4-digit code
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Route to get random code
app.get('/random', async (req, res) => {
  const { user, time, mission } = req.query;

  if (!user || !time || !mission) {
    return res.status(400).json({ error: 'Missing parameters (user, time, mission)' });
  }

  const code = generateCode();

  try {
    // Store code entry in Firebase
    await admin.database().ref('codes').push({
      username: user,
      time: time,
      code: code,
      mission: parseInt(mission),  // ✅ Store mission as number
      used: false
    });

    return res.json({ number: code });
  } catch (err) {
    console.error("Error saving code:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
