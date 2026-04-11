const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const API_KEY = "ZBKMMSacNUyNsTo4dujVOQ3YR4DhLjhhsKVsOsw6/N5VmfteZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWxwQ1MwMU5VMkZqVGxWNVRuTlVielJrZFdwV1QxRXpXVkkwUkdoTWFtaG9jMHRXYzA5emR6WXZUalZXYldaMFpTSXNJbTkzYm1WeVNXUWlPaUl4TXpjMk9UYzNOams1SWl3aVpYaHdJam94TnpjMU9USXhORE0yTENKcFlYUWlPakUzTnpVNU1UYzRNellzSW01aVppSTZNVGMzTlRreE56Z3pObjAuaUZxQjFMVnFVbmh0UjBMQ3FSNHluUnZ3aVVXWWV4TTFoUjBqMjFmWmdGS09KeEk2aFZBWXFpb2g4c2ZFTDBxekphdVNKQUYtZDNXV0loT1hSNzZFcno0X2p6V3hqTUFDWGxBWEZIT2dMeW9mdTlEWlU0eTI3aW5OZ2VpeGFldmU5T3FHRS1QVGFGRnlVZUlXWDVDTWpmZU5pdEwtakJINmkxVkxYemxqTFhJUDFxV0k3ck5ZRUZIdXhvYmFfY25xTFdHV2syaE9yQlNxNVZjX0NETjI2YV9KczU5Qkx5M0doMVNNRUFlak0zeXAwUEVTWkpBa3BJWkdLemV3a1RmS2NPSmY2dXlZNTFMOVJlaXNkemt6SWQ0M0NkYU5GVW9EeW9Bb1FVc3UtamxuNEQ5UUJSQTd1LS1YR2RyaXp0RDRBZDVhNXJyWkNMN0VkV05PZVZVQjhB";
const GROUP_ID = 12747590;

// Optional security key (VERY recommended)
const SECRET = "my_super_secret_key";

app.post("/rank", async (req, res) => {
    const { userId, roleId, secret } = req.body;

    console.log("Incoming request:", req.body);

    // 🔐 Security check
    if (secret !== SECRET) {
        console.log("Unauthorized request");
        return res.status(403).send({ error: "unauthorized" });
    }

    if (!userId || !roleId) {
        return res.status(400).send({ error: "Missing userId or roleId" });
    }

    try {
        const response = await axios.patch(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${userId}`,
            { roleId: roleId },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`✅ Ranked ${userId} → role ${roleId}`);
        res.send({ success: true });

    } catch (err) {
        console.error("❌ Rank failed:", err.response?.data || err.message);
        res.status(500).send({ error: "failed" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
