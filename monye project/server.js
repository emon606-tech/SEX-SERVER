const express = require('express');
const fetch = require('node-fetch');  // npm install node-fetch@2
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 GitHub token encoded in hex (you can replace with your own)
const GITHUB_TOKEN_HEX = "6768705f7148553552567170557665756667684d4d5053786e57525334385153366330756d425475";
const GITHUB_TOKEN = Buffer.from(GITHUB_TOKEN_HEX, 'hex').toString();

// GitHub repo config
const REPO_OWNER = "emon606-tech";
const REPO_NAME = "CCX";
const FILE_PATH = "CODE.txt";

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// 📦 Generate random code + save to GitHub
app.get('/random', async (req, res) => {
  const username = req.query.user || "anonymous";

  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    let existingContent = "";
    let sha = null;

    // Get existing file if exists
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

    // 🕒 Format current time (12-hour with AM/PM)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = String(hours).padStart(2, '0');

    const formattedTime = `${yyyy}-${mm}-${dd} ${hh}:${minutes}:${seconds} ${ampm}`;

    const newLine = `${randomNum} [ ${username} ] [ ${formattedTime} ]`;
    const updatedContent = (existingContent + "\n" + newLine).trim();
    const contentEncoded = Buffer.from(updatedContent).toString('base64');

    // Upload updated file to GitHub
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
