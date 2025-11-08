const axios = require("axios");
const fs = require("fs");

const memoryFile = __dirname + "/memory.json";
let memory = {};
let autoReplyEnabled = true; 

if (fs.existsSync(memoryFile)) {
  try {
    memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
    console.log("✅ Ashley memory loaded.");
    if (typeof memory.autoReplyEnabled !== "undefined") {
      autoReplyEnabled = memory.autoReplyEnabled; 
    }
  } catch (err) {
    console.error("❌ Failed to load memory.json:", err.message);
    memory = {};
  }
} else {
  fs.writeFileSync(memoryFile, JSON.stringify({}, null, 2));
  console.log("🆕 Created new memory.json");
}

function saveMemory() {
  memory.autoReplyEnabled = autoReplyEnabled; 
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

module.exports.config = {
  name: "ash",
  version: "3.4.0",
  credit: "Ari (api by ari)",
  aliases: ["Ashley", "Ash", "Baby"],
  description: "Ashley auto-reply clingy gf 💕",
  category: "fun",
  usePrefix: false
};

module.exports.run = async function ({ api, event, args }) {
  const cmd = args[0] ? args[0].toLowerCase() : "";

  if (cmd === "on") {
    autoReplyEnabled = true;
    saveMemory();
    return api.sendMessage("✅ Ashley auto-reply is now ON", event.threadID, event.messageID);
  }

  if (cmd === "off") {
    autoReplyEnabled = false;
    saveMemory();
    return api.sendMessage("❌ Ashley auto-reply is now OFF", event.threadID, event.messageID);
  }

  if (cmd === "status") {
    return api.sendMessage(
      `Ashley auto-reply is currently ${autoReplyEnabled ? "✅ ON" : "❌ OFF"}.`,
      event.threadID,
      event.messageID
    );
  }

  return api.sendMessage(
    "Hey! I'м Aѕнley yoυ cαɴ cαll мe Aѕн ғor ѕнorт 🥰🫶\n\nUsage:\n• ash on → enable auto-reply\n• ash off → disable auto-reply\n• ash status → check if ON/OFF",
    event.threadID,
    event.messageID
  );
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  if (event.senderID == api.getCurrentUserID()) return;

  if (!autoReplyEnabled) return;

  const userId = event.senderID;
  if (!memory[userId]) memory[userId] = [];

  const aliases = ["ashley"]; 
  const triggerWords = ["love", "miss", "cute", "hun", "mwa", "kiss", "❤️", "💕", "💖", "💞"]; // sweet triggers
  const lowerBody = event.body.toLowerCase();

  const mentioned = aliases.some(alias => lowerBody.includes(alias));
  const isReply = event.type === "message_reply";
  const triggered = triggerWords.some(word => lowerBody.includes(word));

  if (!(mentioned || isReply)) {
    if (triggered) {
      try {
        return api.setMessageReaction("❤️", event.messageID, () => {}, true);
      } catch (err) {
        console.error("Failed to react:", err.message);
      }
    }
    return; 
  }

  try {
    memory[userId].push({ role: "user", content: event.body });
    if (memory[userId].length > 10) {
      memory[userId] = memory[userId].slice(-10);
    }

    // Bagong API endpoint
    const response = await axios.get(`https://urangkapolka.vercel.app/api/aigf?message=${encodeURIComponent(event.body)}`);
    
    let reply = response.data.result || response.data.message || response.data.reply || "Baby~ I'm here 😘";

    memory[userId].push({ role: "assistant", content: reply });
    if (memory[userId].length > 10) {
      memory[userId] = memory[userId].slice(-10);
    }

    saveMemory();

    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (err) {
    console.error("Ashley API error:", err.message);
    api.sendMessage("Sorry baby 😢 Ashley can't reply right now.", event.threadID, event.messageID);
  }
};
