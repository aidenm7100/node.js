const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const API_KEY = "API_KEY";
const GROUP_ID = 12747590;

// 🔐 must match Roblox script
const SECRET = "my_super_secret_key";

app.post("/rank", async (req, res) => {
    console.log("=== Incoming Request ===");
    console.log(req.body);

    const { userId, roleId, secret } = req.body;

    // 🔒 security check
    if (secret !== SECRET) {
        console.log("❌ Unauthorized request");
        return res.status(403).json({ error: "unauthorized" });
    }

    if (!userId || !roleId) {
        return res.status(400).json({ error: "missing userId or roleId" });
    }

    try {
        console.log(`Ranking user ${userId} -> role ${roleId}`);

        // ✅ CORRECT OPEN CLOUD REQUEST
        const response = await axios.post(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships`,
            {
                userId: userId,
                roleId: roleId
            },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Open Cloud Success:");
        console.log(response.data);

        return res.json({
            success: true,
            message: "Player ranked successfully"
        });

    } catch (err) {
        console.log("❌ Open Cloud FAILED:");

        // 🔥 FULL ERROR DEBUG (VERY IMPORTANT)
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
        console.log("Message:", err.message);

        return res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
