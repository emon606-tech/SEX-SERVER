const express = require('express');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 8080;

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

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(Server started on port ${PORT});
});
