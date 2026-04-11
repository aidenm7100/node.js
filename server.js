const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;
const SECRET = "my_super_secret_key";

console.log("API KEY LOADED:", !!API_KEY);

// ===============================
// 💾 CACHE FILE
// ===============================
const CACHE_FILE = "./memberships.json";

let membershipCache = [];

// ===============================
// 📥 LOAD CACHE FROM FILE
// ===============================
function loadCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        }
    } catch (e) {}
    return [];
}

// ===============================
// 💾 SAVE CACHE
// ===============================
function saveCache(data) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

// ===============================
// 🚀 FETCH ALL MEMBERSHIPS (PAGINATION SAFE)
// ===============================
async function fetchAllMemberships() {
    let all = [];
    let pageToken = null;

    while (true) {
        const res = await axios.get(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships`,
            {
                headers: { "x-api-key": API_KEY },
                params: pageToken ? { pageToken } : {}
            }
        );

        const data = res.data;

        all.push(...(data.groupMemberships || []));

        pageToken = data.nextPageToken;

        if (!pageToken) break;
    }

    return all;
}

// ===============================
// 🔄 REFRESH CACHE
// ===============================
async function refreshCache() {
    console.log("Refreshing membership cache...");

    try {
        membershipCache = await fetchAllMemberships();
        saveCache(membershipCache);
        console.log("Cache loaded:", membershipCache.length);
    } catch (err) {
        console.log("Cache refresh failed:", err.message);
    }
}

// ===============================
// 🚀 STARTUP CACHE LOAD
// ===============================
membershipCache = loadCache();
refreshCache();

// refresh every 2 minutes (safe balance)
setInterval(refreshCache, 2 * 60 * 1000);

// ===============================
// 🧠 FIND USER (WITH AUTO REFRESH FALLBACK)
// ===============================
async function findMembership(userId) {
    let membership = membershipCache.find(
        m => m.user === `users/${userId}`
    );

    // 🔥 if not found → refresh ONCE and retry
    if (!membership) {
        console.log("Not found in cache → refreshing...");

        await refreshCache();

        membership = membershipCache.find(
            m => m.user === `users/${userId}`
        );
    }

    return membership;
}

// ===============================
// 🚀 RANK ENDPOINT
// ===============================
app.post("/rank", async (req, res) => {
    const { userId, roleId, secret } = req.body;

    console.log("Incoming request:", req.body);

    if (secret !== SECRET) {
        return res.json({ success: false, error: "unauthorized" });
    }

    try {
        // ===============================
        // 🔍 FIND MEMBERSHIP
        // ===============================
        const membership = await findMembership(userId);

        if (!membership) {
            console.log("❌ No membership found");
            return res.json({ success: false, error: "no_membership" });
        }

        const membershipId = membership.path.split("/").pop();

        console.log("✅ Membership found:", membershipId);

        // ===============================
        // 🟢 UPDATE ROLE (CORRECT METHOD)
        // ===============================
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

        console.log("✅ Role updated");

        return res.json({ success: true });

    } catch (err) {
        console.log("❌ ERROR:");
        console.log(err.response?.data || err.message);

        return res.json({
            success: false,
            error: "rank_failed"
        });
    }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
