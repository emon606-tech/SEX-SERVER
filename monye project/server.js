const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch@2
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 GitHub Token (hex encoded)
const GITHUB_TOKEN_HEX = "6768705f7148553552567170557665756667684d4d5053786e57525334385153366330756d425475";
const GITHUB_TOKEN = Buffer.from(GITHUB_TOKEN_HEX, 'hex').toString();

// GitHub Repo Info
const REPO_OWNER = "emon606-tech";
const REPO_NAME = "CCX";
const FILE_PATH = "CODE.txt";

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.get('/random', async (req, res) => {
  const username = req.query.user || "anonymous";
  const localTime = req.query.time || "UNKNOWN_TIME";

  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    let existingContent = "";
    let sha = null;

    // Fetch current CODE.txt
    const fetchRes = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (fetchRes.status === 200) {
      const data = await fetchRes.json();
      sha = data.sha;
      existingContent = Buffer.from(data.content, 'base64').toString('utf-8');
    }

    const newLine = `${randomNum} [ ${username} ] [ ${localTime} ]`;
    const updatedContent = (existingContent + "\n" + newLine).trim();
    const contentEncoded = Buffer.from(updatedContent).toString('base64');

    // Update GitHub file
    const updateRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: `Add ${randomNum} for ${username}`,
        content: contentEncoded,
        sha: sha,
        committer: {
          name: "Random Number Bot",
          email: "diytouch606@gmail.com"
        }
      })
    });

    if (!updateRes.ok) {
      const errData = await updateRes.text();
      console.error("GitHub API error:", errData);
      return res.status(500).json({ error: "Failed to save number to GitHub" });
    }

    res.json({ number: randomNum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
