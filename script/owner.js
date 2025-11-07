const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

module.exports.config = {
  name: "owner",
  version: "1.0.0",
  credits: "Ari A.K.A pogi",
  description: "Show info card about the owner",
  usage: "{p}owner",
  cooldown: 3
};

module.exports.run = async ({ api, event }) => {
  try {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#06b6d4");
    gradient.addColorStop(1, "#ec4899");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = "rgba(0,255,255,0.7)";
    ctx.shadowBlur = 25;
    ctx.fillRect(20, 20, width - 40, height - 40);

    ctx.shadowBlur = 0;

    const avatar = await loadImage("https://i.imgur.com/HvNZezn.png");
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 200, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 100, 200, 200);
    ctx.restore();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px Poppins";
    ctx.fillText("ARI", 300, 160);

    ctx.fillStyle = "#ffccff";
    ctx.font = "bold 32px Poppins";
    ctx.fillText("⚡ Autobot Owner ⚡", 300, 210);

    ctx.fillStyle = "#e5e5e5";
    ctx.font = "22px Poppins";
    ctx.fillText(" Full Stack Coder • Creator of Bots", 300, 260);
    ctx.fillText(" Always Online • Innovating Everyday", 300, 300);

    const path = __dirname + "/cache/owner_card.png";
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path, buffer);

    api.sendMessage(
      {
        body: "👑 𝔬𝔴𝔫𝔢𝔯 𝔦𝔫𝔣𝔬 👑",
        attachment: fs.createReadStream(path)
      },
      event.threadID,
      () => fs.unlinkSync(path),
      event.messageID
    );
  } catch (err) {
    api.sendMessage("❌ Error generating owner card: " + err.message, event.threadID, event.messageID);
  }
};
