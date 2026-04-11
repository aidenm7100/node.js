const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;

const SECRET = "my_super_secret_key";
const webhookUrl = "YOUR_DISCORD_WEBHOOK";

console.log("API KEY LOADED:", !!API_KEY);

app.post("/rank", async (req, res) => {
    console.log("=== Incoming Request ===");
    console.log(req.body);

    const { userId, roleId, secret } = req.body;

    // 🔐 security check
    if (secret !== SECRET) {
        console.log("❌ Unauthorized request");

        // NEVER 500
        return res.json({ success: false, error: "unauthorized" });
    }

    if (!userId || !roleId) {
        return res.json({ success: false, error: "missing data" });
    }

    let rankSuccess = false;

    try {
        console.log(`Ranking user ${userId} -> role ${roleId}`);

        // ✅ OPEN CLOUD REQUEST
        const response = await axios.patch(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${userId}`,
            {
                roleId: roleId
            },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Open Cloud Success");
        rankSuccess = true;

    } catch (err) {
        console.log("❌ Rank failed:");
        console.log(err.response?.data || err.message);
    }

    // 🔥 ALWAYS RESPOND TO ROBLOX (NEVER 500)
    res.json({
        success: rankSuccess
    });

    // 🔥 DISCORD WEBHOOK (NON-BLOCKING SAFE)
    try {
        await axios.post(webhookUrl, {
            content: rankSuccess
                ? `✅ Ranked user ${userId} to role ${roleId}`
                : `❌ Failed to rank user ${userId}`
        });

        console.log("Webhook sent");
    } catch (err) {
        console.log("Webhook failed:", err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
