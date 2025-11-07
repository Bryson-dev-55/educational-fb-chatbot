const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports.config = {
    name: "welcome",
    version: "1.1.0",
    eventType: ["log:subscribe"],
    description: "Send welcome card when member joins"
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const addedUsers = event.logMessageData.addedParticipants || [];

    const groupInfo = await api.getThreadInfo(event.threadID);
    const groupName = groupInfo.threadName || "this group";

    for (const user of addedUsers) {
        const userID = user.userFbId;
        let name = await api.getUserInfo(userID).then(info => info[userID].name);

        const quotes = [
            "Welcome aboard, let's achieve greatness!",
            "New adventures start with great friends.",
            "Together, we can conquer the world!",
            "Welcome to the team of dreamers.",
            "A new journey begins with you.",
            "Let’s make today a memorable one.",
            "Excited to have you here, welcome!",
            "We grow stronger with you here.",
            "New beginnings, new hopes, welcome!",
            "Welcome to the group of achievers."
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const profilePic = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

        const url = `https://nexalo-api.vercel.app/api/welcome-card?image=${encodeURIComponent(profilePic)}&username=${encodeURIComponent(name)}&text=${encodeURIComponent(randomQuote)}`;

        try {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const baseImage = await loadImage(Buffer.from(data));

            const canvas = createCanvas(baseImage.width, baseImage.height);
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(baseImage, 0, 0);

            ctx.font = "12px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom"; 
            ctx.fillText(`Welcome to ${groupName}`, 20, canvas.height - 10);

            ctx.font = '16px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.7)'; 
            ctx.textAlign = 'right';
            ctx.fillText('created by : ARI', baseImage.width - 10, baseImage.height - 10);

            const buffer = canvas.toBuffer();
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const filePath = path.join(cacheDir, `welcome_${Date.now()}.png`);
            fs.writeFileSync(filePath, buffer);

            api.sendMessage({
                body: `🎉 Welcome ${name} to ${groupName}!\n💭 Quote: ${randomQuote}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (err) {
            console.error("[Welcome Event Error]", err.message);
            api.sendMessage(`🎉 Welcome ${name} to ${groupName}!`, event.threadID);
        }
    }
};
