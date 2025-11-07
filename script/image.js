const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "image",
    aliases: [],
    version: "1.1",
    author: "real owner (converted by ari)",
    countDown: 0,
    role: 0,
    shortDescription: "Edit or generate an image using Gemini-Edit",
    category: "𝗔𝗜"
};

module.exports.run = async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide the text to edit or generate.", event.threadID, event.messageID);

    const apiurl = "https://gemini-edit-omega.vercel.app/edit";
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
        let params = { prompt };

        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]) {
            params.imgurl = event.messageReply.attachments[0].url;
        }

        const res = await axios.get(apiurl, { params });

        if (!res.data || !res.data.images || !res.data.images[0]) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return api.sendMessage("❌ Failed to get image.", event.threadID, event.messageID);
        }

        const base64Image = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Image, "base64");

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const imagePath = path.join(cacheDir, `${Date.now()}.png`);
        fs.writeFileSync(imagePath, imageBuffer);

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        return api.sendMessage(
            { attachment: fs.createReadStream(imagePath) },
            event.threadID,
            () => fs.unlinkSync(imagePath),
            event.messageID
        );

    } catch (error) {
        console.error("❌ API ERROR:", error.response?.data || error.message);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("Error generating/editing image.", event.threadID, event.messageID);
    }
};
