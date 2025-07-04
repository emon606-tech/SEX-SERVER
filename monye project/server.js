const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 8080;

// Firebase config
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

app.use(express.static('public')); // serve HTML from public folder if needed

// 🔑 Random Code Generator Endpoint
app.get('/random', async (req, res) => {
  const { user, mission } = req.query;
  if (!user || !mission) {
    return res.status(400).json({ error: 'Missing user or mission' });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit

  const db = admin.database();
  const codesRef = db.ref('codes');

  try {
    await codesRef.push({
      username: user,
      mission: mission,
      code: code,
      used: false,
      createdAt: new Date().toISOString()
    });

    res.json({ number: code });
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
