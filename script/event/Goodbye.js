const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports.config = {
    name: "goodbye",
    version: "1.3.0",
    eventType: ["log:unsubscribe"],
    description: "Send goodbye card when member leaves"
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const leftID = event.logMessageData.leftParticipantFbId;
    let name = await api.getUserInfo(leftID).then(info => info[leftID].name);

    const quotes = [
        "Goodbye, we'll miss you!",
        "Off you go, take care!",
        "Wishing you the best on your journey!",
        "Another door closes, good luck ahead!",
        "You’ll always be remembered here!",
        "Farewell, may luck be with you!"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const profilePic = `https://graph.facebook.com/${leftID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const url = `https://nexalo-api.vercel.app/api/goodbye-card?image=${encodeURIComponent(profilePic)}&username=${encodeURIComponent(name)}&text=${encodeURIComponent(randomQuote)}`;

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' });
        const baseImage = await loadImage(Buffer.from(data));

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(baseImage, 0, 0);

        ctx.font = '18px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; 
        ctx.textAlign = 'right';
        ctx.fillText('created by : ARI', baseImage.width - 10, baseImage.height - 10);

        const buffer = canvas.toBuffer();
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const filePath = path.join(cacheDir, `goodbye_${Date.now()}.png`);
        fs.writeFileSync(filePath, buffer);

        api.sendMessage({
            body: `👋 ${name} has left the group.\n💭 Quote: ${randomQuote}`,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
    } catch (err) {
        console.error("[Goodbye Event Error]", err.message);
        api.sendMessage(`👋 ${name} has left the group.`, event.threadID);
    }
};
