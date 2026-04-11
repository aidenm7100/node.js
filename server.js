const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

const API_KEY = process.env.API_KEY;
const GROUP_ID = 12747590;
const SECRET = "my_super_secret_key";

const CACHE_FILE = "./memberships.json";

// ==========================
// 🔥 LOAD CACHE FROM FILE
// ==========================
function loadCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        }
    } catch (e) {
        console.log("Cache load failed");
    }
    return [];
}

// ==========================
// 💾 SAVE CACHE
// ==========================
function saveCache(data) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

// ==========================
// 🚀 FETCH ALL MEMBERSHIPS (PAGINATED)
// ==========================
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

// ==========================
// 🔄 REFRESH CACHE ON START
// ==========================
let membershipCache = loadCache();

async function refreshCache() {
    console.log("Refreshing membership cache...");

    membershipCache = await fetchAllMemberships();

    saveCache(membershipCache);

    console.log("Cache updated:", membershipCache.length, "members");
}

// run once at startup
refreshCache();

// optional refresh every 10 minutes
setInterval(refreshCache, 10 * 60 * 1000);

// ==========================
// 🚀 RANK ENDPOINT
// ==========================
app.post("/rank", async (req, res) => {
    const { userId, roleId, secret } = req.body;

    if (secret !== SECRET) {
        return res.json({ success: false, error: "unauthorized" });
    }

    try {
        console.log("Using cached memberships...");

        const membership = membershipCache.find(m =>
            m.user === `users/${userId}`
        );

        if (!membership) {
            return res.json({ success: false, error: "no_membership" });
        }

        const membershipId = membership.path.split("/").pop();

        console.log("Membership found:", membershipId);

        // assign role
        await axios.post(
            `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${membershipId}:assignRole`,
            { roleId },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({ success: true });

    } catch (err) {
        console.log("ERROR:", err.response?.data || err.message);

        return res.json({
            success: false,
            error: "rank_failed"
        });
    }
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
