const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// 🔐 ENVIRONMENT VARIABLES (Render / Railway)
const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;

// 🔐 must match Roblox script
const SECRET = "my_super_secret_key";

console.log("API KEY LOADED:", !!API_KEY);

app.post("/rank", async (req, res) => {
    console.log("=== Incoming Request ===");
    console.log(req.body);

    const { userId, roleId, secret } = req.body;

    // 🔒 security check
    if (secret !== SECRET) {
        return res.json({ success: false, error: "unauthorized" });
    }

    if (!userId || !roleId) {
        return res.json({ success: false, error: "missing_data" });
    }

    try {
        // ==============================
        // 1️⃣ GET MEMBERSHIP ID
        // ==============================
        console.log("Fetching membership...");

        const membershipRes = await axios.get(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships`,
            {
                params: { userId },
                headers: {
                    "x-api-key": API_KEY
                }
            }
        );

        const membershipId = membershipRes.data?.memberships?.[0]?.id;

        if (!membershipId) {
            console.log("❌ No membership found");
            return res.json({ success: false, error: "no_membership" });
        }

        console.log("Membership ID:", membershipId);

        // ==============================
        // 2️⃣ OPTIONAL: UNASSIGN OLD ROLE (SAFE CLEANUP)
        // ==============================
        try {
            await axios.post(
                `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${membershipId}:unassignRole`,
                {},
                {
                    headers: {
                        "x-api-key": API_KEY
                    }
                }
            );

            console.log("Old role unassigned (if existed)");
        } catch (err) {
            console.log("Unassign skipped (non-fatal)");
        }

        // ==============================
        // 3️⃣ ASSIGN NEW ROLE
        // ==============================
        const response = await axios.post(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${membershipId}:assignRole`,
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

        console.log("✅ Role assigned successfully");
        console.log(response.data);

        // ==============================
        // 4️⃣ RESPONSE TO ROBLOX
        // ==============================
        return res.json({
            success: true
        });

    } catch (err) {
        console.log("❌ ERROR OCCURRED");
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
        console.log("Message:", err.message);

        // IMPORTANT: always return 200-style JSON (avoid Roblox HTTP 500 confusion)
        return res.json({
            success: false,
            error: "rank_failed",
            details: err.response?.data || err.message
        });
    }
});

// ==============================
// START SERVER
// ==============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
