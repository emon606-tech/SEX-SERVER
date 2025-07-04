const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // Enable CORS for frontend calls

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

// Helper function to generate 4-digit random code as string
function generate4DigitCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Endpoint to generate a code for a user and mission
// Example call: /random?user=Emon12&mission=2
app.get('/random', async (req, res) => {
  const username = req.query.user;
  const mission = parseInt(req.query.mission, 10);

  if (!username || !mission || mission < 1 || mission > 40) {
    return res.status(400).json({ error: 'Invalid user or mission' });
  }

  // Generate new 4-digit code
  const code = generate4DigitCode();

  // Prepare code object
  const codeData = {
    code: code,
    username: username,
    mission: mission,
    used: false,
    createdAt: new Date().toISOString()
  };

  try {
    // Store code in Firebase under "codes"
    const newCodeRef = db.ref('codes').push();
    await newCodeRef.set(codeData);

    // Return the generated code info to client
    res.json({
      code: code,
      username: username,
      mission: mission,
      used: false
    });
  } catch (err) {
    console.error("Error saving code:", err);
    res.status(500).json({ error: "Failed to generate code" });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
