// ---------- ✅ BACKEND: server.js (Node.js + Express + Firebase Admin) ----------

const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

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

const db = admin.database();

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/random', async (req, res) => {
  const username = req.query.user;
  const mission = req.query.mission;

  if (!username || !mission) return res.status(400).json({ error: 'Missing user or mission' });

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const timestamp = new Date().toISOString();

  const ref = db.ref("codes").push();
  await ref.set({
    code,
    username,
    mission,
    timestamp,
    used: false
  });

  res.json({ number: code });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
