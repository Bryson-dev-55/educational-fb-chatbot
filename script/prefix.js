const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

try {
  registerFont(path.join(__dirname, "../fonts/OpenSans-Bold.ttf"), { family: "OpenSans" });
  registerFont(path.join(__dirname, "../fonts/OpenSans-Regular.ttf"), { family: "OpenSans-Regular" });
} catch (e) {
  console.log("⚠️ Font not found, using system default.");
}

let config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json")));
} catch (e) {
  config.prefix = "[ no set ]";
  config.botName = "Echo AI";
  config.ownerName = "Ari"; 
}

module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  role: 0,
  description: "bot prefix",
  prefix: true,
  credits: "ari POGI",
  cooldowns: 5,
  category: "info"
};

const emojiMap = {
  bot: "https://twemoji.maxcdn.com/v/latest/72x72/1f916.png",
  pin: "https://twemoji.maxcdn.com/v/latest/72x72/1f4cc.png",
  id: "https://twemoji.maxcdn.com/v/latest/72x72/1f194.png",
  crown: "https://twemoji.maxcdn.com/v/latest/72x72/1f451.png"
};

async function drawEmoji(ctx, url, x, y, size = 36) {
  try {
    const img = await loadImage(url);
    ctx.drawImage(img, x, y, size, size);
  } catch (err) {
    console.log("⚠️ Emoji failed:", url);
  }
}

function drawParticles(ctx, width, height, count = 40) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 3 + 1;
    const opacity = Math.random() * 0.8 + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

async function makeCoolCard(botPrefix, botName, ownerName) {
  const width = 750, height = 460;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0f2027");
  bgGradient.addColorStop(0.5, "#203a43");
  bgGradient.addColorStop(1, "#2c5364");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  drawParticles(ctx, width, height, 50);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(40, 110, width - 80, 310, 25);
  ctx.fill();
  ctx.shadowBlur = 0;

  try {
    const avatar = await loadImage("https://i.imgur.com/lGxhMfB.png");
    const centerX = width / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 95, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#0ea5e9";
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar, centerX - 60, 35, 120, 120);
    ctx.restore();
  } catch {}

  await drawEmoji(ctx, emojiMap.bot, 120, 150, 42);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 34px OpenSans";
  ctx.fillText("Bot Information:", 180, 185);

  await drawEmoji(ctx, emojiMap.pin, 120, 215, 38);
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 30px OpenSans";
  ctx.fillText(`Prefix: ${botPrefix}`, 180, 245);

  await drawEmoji(ctx, emojiMap.id, 120, 275, 38);
  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 30px OpenSans";
  ctx.fillText(`Name: ${botName}`, 180, 305);

  await drawEmoji(ctx, emojiMap.crown, 120, 335, 38);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 30px OpenSans";
  ctx.fillText(`Owner: ${ownerName}`, 180, 365);

  const gradient = ctx.createLinearGradient(200, 0, 550, 0);
  gradient.addColorStop(0, "#f472b6");
  gradient.addColorStop(0.25, "#facc15");
  gradient.addColorStop(0.5, "#4ade80");
  gradient.addColorStop(0.75, "#60a5fa");
  gradient.addColorStop(1, "#c084fc");

  ctx.fillStyle = gradient;
  ctx.font = "italic 21px OpenSans-Regular";
  ctx.textAlign = "center";
  ctx.fillText("Enjoy chatting with me!", width / 2, 410);

  return canvas.toBuffer();
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const botPrefix = config.prefix || "[ no set ]";
  const botName = config.botName || "Echo AI";
  const ownerName = config.ownerName || "Ari";

  const imgBuffer = await makeCoolCard(botPrefix, botName, ownerName);
  const filePath = path.join(__dirname, `prefix_${Date.now()}.png`);
  fs.writeFileSync(filePath, imgBuffer);

  return api.sendMessage(
    { body: "", attachment: fs.createReadStream(filePath) },
    threadID,
    () => fs.unlinkSync(filePath),
    messageID
  );
};
