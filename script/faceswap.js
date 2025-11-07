const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "faceswap",
    version: "1.2.0",
    credits: "Ari",
    description: "Swap faces between two images",
    usages: "faceswap (reply with 2 images)",
    commandCategory: "fun",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    try {
        if (!event.messageReply || !event.messageReply.attachments) {
            return api.sendMessage("❌ Please reply to a message with 2 images (source + target).", event.threadID, event.messageID);
        }

        const images = event.messageReply.attachments.filter(a => a.type === "photo");

        if (images.length < 2) {
            return api.sendMessage("❌ You must reply with 2 images (first = source face, second = target image).", event.threadID, event.messageID);
        }

        const [source, target] = images;
        const apikey = "8721466d-c231-4641-a691-50ede6fdce52";

        const apiUrl = `https://kaiz-apis.gleeze.com/api/faceswap-v2?sourceUrl=${encodeURIComponent(source.url)}&targetUrl=${encodeURIComponent(target.url)}&apikey=${apikey}`;

        console.log("Faceswap API Call:", apiUrl); 

        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        const outputPath = path.join(__dirname, "cache", `faceswap_${Date.now()}.png`);
        fs.writeFileSync(outputPath, Buffer.from(response.data, "binary"));

        return api.sendMessage(
            { body: "✅ Face swapped successfully!", attachment: fs.createReadStream(outputPath) },
            event.threadID,
            () => fs.unlinkSync(outputPath),
            event.messageID
        );

    } catch (err) {
        console.error("Faceswap Error:", err?.response?.data || err.message);

        if (err?.response?.status === 400) {
            return api.sendMessage("❌ Error 400: Bad Request.\nMake sure you replied with **2 clear images** (not stickers/videos).", event.threadID, event.messageID);
        }

        return api.sendMessage("❌ Failed to swap faces. Please try again later.", event.threadID, event.messageID);
    }
};
