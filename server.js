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
        // 1️⃣ GET MEMBERSHIPS
        // ==============================
        const membershipRes = await axios.get(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships`,
            {
                headers: {
                    "x-api-key": API_KEY
                }
            }
        );

        const memberships = membershipRes.data.groupMemberships || [];

        console.log("Total memberships:", memberships.length);

        // ==============================
        // 2️⃣ FIND USER (IMPORTANT FIX)
        // ==============================
        const membership = memberships.find(m =>
            m.user === `users/${userId}`
        );

        if (!membership) {
            console.log("❌ No membership found");
            return res.json({ success: false, error: "no_membership" });
        }

        // ==============================
        // 3️⃣ EXTRACT MEMBERSHIP ID
        // ==============================
        const membershipId = membership.path.split("/").pop();

        console.log("Membership found:");
        console.log("User:", membership.user);
        console.log("Role:", membership.role);
        console.log("Membership ID:", membershipId);

        // ==============================
        // 4️⃣ OPTIONAL: UNASSIGN OLD ROLE
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
        } catch (e) {
            console.log("Unassign skipped (not critical)");
        }

        // ==============================
        // 5️⃣ ASSIGN NEW ROLE
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
        // 6️⃣ RESPONSE BACK TO ROBLOX
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
