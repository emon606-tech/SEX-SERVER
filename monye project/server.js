const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Decode token from hex
const GITHUB_TOKEN_HEX = "6768705f7148553552567170557665756667684d4d5053786e57525334385153366330756d425475";
const GITHUB_TOKEN = Buffer.from(GITHUB_TOKEN_HEX, 'hex').toString();

const REPO_OWNER = "emon606-tech";
const REPO_NAME = "CCX";
const FILE_PATH = "CODE.txt";

app.use(express.static(path.join(__dirname, 'public')));

async function getFileSha() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  });
  if (res.status === 200) {
    const data = await res.json();
    return data.sha;
  } else {
    return null;
  }
}

app.get('/random', async (req, res) => {
  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    const contentEncoded = Buffer.from(randomNum).toString('base64');

    const sha = await getFileSha();

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const body = {
      message: `Update random number to ${randomNum}`,
      content: contentEncoded,
      committer: {
        name: "Random Number Bot",
        email: "diytouch606@gmail.com"
      }
    };
    if (sha) {
      body.sha = sha;
    }

    const updateRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify(body)
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
  console.log(`Server running on port ${PORT}`);
});
