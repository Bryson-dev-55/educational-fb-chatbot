const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "billboard",
    version: "1.0.0",
    credits: "Ari",
    description: "Generate a billboard image with your text",
    usages: "billboard [text]",
    commandCategory: "fun",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        if (args.length === 0) {
            return api.sendMessage("❌ Please provide some text.\n\nUsage: billboard [your text]", event.threadID, event.messageID);
        }

        const text = args.join(" ");
        const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/billboard?text=${encodeURIComponent(text)}`;

        const outputPath = path.join(__dirname, "cache", `billboard_${Date.now()}.png`);
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(outputPath, Buffer.from(response.data, "binary"));

        return api.sendMessage(
            { body: `🛑 Billboard generated with text: "${text}"`, attachment: fs.createReadStream(outputPath) },
            event.threadID,
            () => fs.unlinkSync(outputPath),
            event.messageID
        );

    } catch (err) {
        console.error("Billboard Error:", err?.response?.data || err.message);
        return api.sendMessage("❌ Failed to generate billboard. Please try again later.", event.threadID, event.messageID);
    }
};
