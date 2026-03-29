const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Alt account login info (store in Railway Environment Variables for safety)
const ALT_COOKIE = process.env.ALT_COOKIE; // Roblox security cookie
const GROUP_ID = process.env.GROUP_ID;     // Your group ID

// Mapping of purchased ranks to Group Rank IDs
const RankTable = {
  "63931599": 3,
  "63931910": 4,
  "63931960": 5,
  "63932090": 6,
  "63933309": 7,
  "63933720": 8,
  "63934350": 9,
  "63934377": 10,
  "63934438": 11,
  "1772775525": 12,
  "1773429466": 13,
  "1772913500": 14
};

// Endpoint for Roblox server to request rank update
app.post("/updateRank", async (req, res) => {
  const { UserId, PurchasedRank } = req.body;

  if (!UserId || !PurchasedRank) {
    return res.status(400).json({ error: "Missing UserId or PurchasedRank" });
  }

  const groupRankId = RankTable[PurchasedRank];
  if (!groupRankId) {
    return res.status(400).json({ error: "Invalid rank" });
  }

  try {
    // TODO: Implement alt account login + group rank update logic here
    // Example placeholder (replace with actual Roblox API calls via alt account)
    console.log(`Updating UserId ${UserId} to rank ${groupRankId} in group ${GROUP_ID}`);

    // Respond success
    res.json({ success: true, message: `User ${UserId} ranked to ${groupRankId}` });
  } catch (err) {
    console.error("Failed to update rank:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rank updater server running on port ${PORT}`);
});
