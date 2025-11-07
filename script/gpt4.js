const axios = require('axios');

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return [...text].map(char => fontEnabled && fontMapping[char] ? fontMapping[char] : char).join('');
}

module.exports.config = {
  name: 'gpt4',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['askgpt', 'rygpt'],
  description: "Talk to GPT-4 conversational bot",
  usage: "gpt4 [your question]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const promptText = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!promptText) {
    return api.sendMessage(formatFont("❌ Please provide a prompt."), threadID, messageID);
  }

  api.sendMessage(formatFont('🤖 𝗚𝗣𝗧𝟰 𝗖𝗢𝗡𝗩𝗘𝗥𝗦𝗔𝗧𝗜𝗢𝗡 𝗜𝗡 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦...'), threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get(`https://api-rynx.onrender.com/api/gpt4-convo`, {
        params: {
          prompt: promptText,
          uid: senderID
        },
        headers: {
          "Content-Type": "application/json"
        }
      });

      const responseText = res.data?.response?.trim() || "❌ No response from GPT-4 AI.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

        const replyMessage = `
🤖 𝗚𝗣𝗧𝟰 𝗔𝗜 𝗖𝗢𝗡𝗩𝗘𝗥𝗦𝗔𝗧𝗜𝗢𝗡
━━━━━━━━━━━━━━━━━━
${responseText}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(replyMessage), info.messageID);
      });

    } catch (error) {
      console.error("GPT-4 API Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};
