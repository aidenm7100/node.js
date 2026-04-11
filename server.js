const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;

// must match Roblox script
const SECRET = "my_super_secret_key";

console.log("API KEY LOADED:", !!API_KEY);

app.post("/rank", async (req, res) => {
    const { userId, roleId, secret } = req.body;

    console.log("=== Incoming Request ===");
    console.log(req.body);

    // 🔐 security check
    if (secret !== SECRET) {
        return res.json({ success: false, error: "unauthorized" });
    }

    if (!userId || !roleId) {
        return res.json({ success: false, error: "missing_data" });
    }

    try {
        // ==============================
        // 1️⃣ GET ALL MEMBERSHIPS
        // ==============================
        console.log("Fetching memberships...");

        const membershipRes = await axios.get(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships`,
            {
                headers: {
                    "x-api-key": API_KEY
                }
            }
        );

        const memberships = membershipRes.data?.memberships || [];

        console.log("Total memberships:", memberships.length);

        // ==============================
        // 2️⃣ FIND USER MEMBERSHIP
        // ==============================
        const membership = memberships.find(m => {
            return (
                m.profile?.userId === userId ||
                m.userId === userId
            );
        });

        if (!membership) {
            console.log("❌ No membership found for user");
            return res.json({ success: false, error: "no_membership" });
        }

        const membershipId = membership.name.split("/").pop();

        console.log("Membership ID:", membershipId);

        // ==============================
        // 3️⃣ OPTIONAL UNASSIGN OLD ROLE
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

            console.log("Old role unassigned");
        } catch (err) {
            console.log("Unassign skipped (not required)");
        }

        // ==============================
        // 4️⃣ ASSIGN NEW ROLE
        // ==============================
        await axios.post(
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

        // ==============================
        // 5️⃣ RESPONSE
        // ==============================
        return res.json({
            success: true
        });

    } catch (err) {
        console.log("❌ ERROR:");
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
        console.log("Message:", err.message);

        return res.json({
            success: false,
            error: "rank_failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
