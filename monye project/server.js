const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin using environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://missionpay-78730-default-rtdb.firebaseio.com/'
});

const db = admin.database();

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to generate and store random code
app.get('/random', async (req, res) => {
  const username = req.query.user || "anonymous";
  const localTime = req.query.time || "UNKNOWN_TIME";

  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    const ref = db.ref(`codes/${randomNum}`);

    const snapshot = await ref.once('value');
    if (snapshot.exists()) {
      return res.status(400).json({ error: "Code already used. Try again." });
    }

    const codeData = `[ ${username} ] [ ${localTime} ]`;
    await ref.set(codeData);

    res.json({ number: randomNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Firebase server running on port ${PORT}`);
});
