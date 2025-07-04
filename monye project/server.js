const crypto = require('crypto');

app.get('/random', async (req, res) => {
  const username = req.query.user;
  const mission = parseInt(req.query.mission, 10);

  if (!username || !mission || mission < 1 || mission > 40) {
    return res.status(400).json({ error: 'Invalid user or mission' });
  }

  const code = generate4DigitCode();

  // Generate a unique session token (random string)
  const sessionToken = crypto.randomBytes(16).toString('hex');

  const codeData = {
    code,
    username,
    mission,
    used: false,
    sessionToken,         // store session token here
    createdAt: new Date().toISOString()
  };

  try {
    const newCodeRef = db.ref('codes').push();
    await newCodeRef.set(codeData);

    // Return both code and session token to client
    res.json({
      code,
      sessionToken,
    });
  } catch (err) {
    console.error("Error saving code:", err);
    res.status(500).json({ error: "Failed to generate code" });
  }
});
