const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// 🔐 ENV VARIABLES (Render / Railway)
const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;

// 🔐 must match Roblox script
const SECRET = "my_super_secret_key";

// Discord webhook (optional safe logging)
const webhookUrl = "https://discord.com/api/webhooks/1487956895154180137/xqNQxj7dr7phIw2VskHrLRcVl9ymvxWvk43FZemUlINhnH-bpgRX0IUzFncFq6W3ThX3";

console.log("API KEY LOADED:", !!API_KEY);

app.post("/rank", async (req, res) => {
    console.log("=== Incoming Request ===");
    console.log(req.body);

    const { userId, roleId, secret } = req.body;

    // 🔒 security check
    if (secret !== SECRET) {
        console.log("❌ Unauthorized request");

        return res.json({
            success: false,
            error: "unauthorized"
        });
    }

    if (!userId || !roleId) {
        return res.json({
            success: false,
            error: "missing userId or roleId"
        });
    }

    let success = false;

    try {
        console.log(`Ranking user ${userId} -> role ${roleId}`);

        // ✅ FIXED OPEN CLOUD ENDPOINT
        const response = await axios.post(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/roles/${roleId}/users/${userId}`,
            {},
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Open Cloud Success");
        console.log(response.data);

        success = true;

    } catch (err) {
        console.log("❌ Rank failed:");
        console.log(err.response?.data || err.message);
    }

    // 🔥 ALWAYS RESPOND TO ROBLOX (NEVER 500)
    res.json({
        success: success
    });

    // 🔥 SAFE WEBHOOK (won’t break ranking)
    if (webhookUrl) {
        try {
            await axios.post(webhookUrl, {
                content: success
                    ? `✅ Ranked user ${userId} to role ${roleId}`
                    : `❌ Failed to rank user ${userId}`
            });
        } catch (err) {
            console.log("Webhook error:", err.message);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
