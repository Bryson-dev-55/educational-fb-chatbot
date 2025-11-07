const axios = require("axios");
const endpoint = "https://simsimi-api-pro.onrender.com/sim?query=";
const key = "a650beda66094d58b3e5c84b664420e8f2e65edd";

// Store last reply message IDs para iwas loop
let lastBotReplies = new Set();

module.exports.config = {
    name: "sim",
    version: "1.1.0",
    hasPermission: 0,
    credits: "Ari + AJ (Safe Auto-Reply)",
    description: "Simsimi chat mode (command + safe auto-reply)",
    commandCategory: "fun",
    usages: "[message]",
    cooldowns: 1
};

async function sendSimSimi(api, event, text) {
    try {
        const { data } = await axios.get(`${endpoint}${encodeURIComponent(text)}&apikey=${key}`);

        api.sendMessage(data.respond, event.threadID, (err, info) => {
            if (!err) {
                lastBotReplies.add(info.messageID);
                if (lastBotReplies.size > 50) {
                    lastBotReplies.delete([...lastBotReplies][0]);
                }
            }
        }, event.messageID);
    } catch (e) {
        console.error(e);
        api.sendMessage("❌ Error fetching Simsimi's response.", event.threadID, event.messageID);
    }
}

// Command mode
module.exports.run = async function ({ api, event, args }) {
    const q = args.join(" ");
    if (!q) return api.sendMessage("Ano?", event.threadID, event.messageID);
    return sendSimSimi(api, event, q);
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.type !== "message_reply") return;
    if (!event.messageReply) return;

    if (event.messageReply.senderID !== api.getCurrentUserID()) return;

    if (lastBotReplies.has(event.messageReply.messageID)) {
        return sendSimSimi(api, event, event.body);
    }
};
