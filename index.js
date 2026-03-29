require('dotenv').config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const GROUP_ID = process.env.GROUP_ID;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

app.post("/updateRank", async (req, res) => {
    const { userId, purchasedRank, token } = req.body;

    if (!userId || !purchasedRank || !token) {
        return res.status(400).send({ success: false, error: "Missing fields" });
    }

    if (token !== SECRET_TOKEN) return res.status(403).send({ success: false, error: "Forbidden" });

    try {
        // Update the user's group rank via Roblox API
        await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            { roleId: purchasedRank },
            {
                headers: {
                    "Authorization": `Bearer ${ROBLOX_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`Rank updated: User ${userId} → Role ${purchasedRank}`);
        res.send({ success: true });
    } catch (err) {
        console.error("Failed to update rank:", err.response?.data || err.message);
        res.status(500).send({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rank updater server running on port ${PORT}`));
