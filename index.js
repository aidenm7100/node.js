// proxy.js
const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

const USER_API_KEY = "vv9v6wzz1k686Y3uKDStPuQncRuvldxqH2JtB4uEI727IVlIZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW5aMk9YWTJkM3A2TVdzMk9EWlpNM1ZMUkZOMFVIVlJibU5TZFhac1pIaHhTREpLZEVJMGRVVkpOekkzU1Zac1NTSXNJbTkzYm1WeVNXUWlPaUl4TURjME1UZ3lNemd3TUNJc0ltVjRjQ0k2TVRjM05EYzBNalV3Tnl3aWFXRjBJam94TnpjME56TTRPVEEzTENKdVltWWlPakUzTnpRM016ZzVNRGQ5LmZ2TGVhcmRZZTBBUERMVEpVN3ZINThfblJtYi1haW45Z2FhaEtwdThkalB3cHZhZHFQWGV0VmdIWFNoVEZ2MW9rQVRfbXlFcy1NR2w2cFBkbFNfT2d4dnRROGhEY1BXc2oxUzV6RlloYlI4UWQwWmxDd3Bib1FTelRrcmpYZGRvRWdMOU1PNkpfYl92TmJwSW9HY3VkVUVKc3o4d015RjBoRFpHNmREQ1lsQVZHUDdmbkY5UjM0UjhQOXBjS2Zjdkd1Y3FwZFk1X3RuaElabWxzVDJCOEFVLXJzZm0wMl9hSGo5WmE1ZUdPcXJxS0NFN0lDU3dCUzBUYUtIaDFfOGszUzhNT1JuT1A5WnotZXJXRmJOTWNRN0ZCOVpxUUdabzIyN0FFd0RwUGVMVDR3elR2c3pxdWh0a0E4bkxGUHBKVEdMQlg3Zk9ldzlScUxQVjRFb0xtdw=="; // generated in Roblox account settings
const GROUP_ID = 12747590; // replace with your group ID

app.post("/getGroupRank", async (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const response = await fetch(`https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/members/${userId}`, {
      headers: {
        "Authorization": `Bearer ${USER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) return res.status(500).json({ error: "Failed to fetch" });

    const data = await response.json();

    // Send simplified data back to the game
    res.json({
      userId: data.user.id,
      username: data.user.username,
      roleId: data.role.id,
      rankName: data.role.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("Proxy server running on port 3000"));
