const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;

const SECRET = "my_super_secret_key";

console.log("API KEY LOADED:", !!API_KEY);

app.post("/rank", async (req, res) => {
    const { userId, roleId, secret } = req.body;

    if (secret !== SECRET) {
        return res.json({ success: false, error: "unauthorized" });
    }

    try {
        // ==========================
        // GET MEMBERSHIPS (cached or live)
        // ==========================
        const membershipRes = await axios.get(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships`,
            {
                headers: {
                    "x-api-key": API_KEY
                }
            }
        );

        const memberships = membershipRes.data.groupMemberships || [];

        const membership = memberships.find(m =>
            m.user === `users/${userId}`
        );

        if (!membership) {
            return res.json({ success: false, error: "no_membership" });
        }

        const membershipId = membership.path.split("/").pop();

        console.log("Membership ID:", membershipId);

        // ==========================
        // 🔥 CORRECT ROLE UPDATE METHOD
        // ==========================
        await axios.patch(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${membershipId}`,
            {
                role: `groups/${GROUP_ID}/roles/${roleId}`
            },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Role updated successfully");

        return res.json({ success: true });

    } catch (err) {
        console.log("ERROR:");
        console.log(err.response?.data || err.message);

        return res.json({
            success: false,
            error: "rank_failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
