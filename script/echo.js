const axios = require("axios");

module.exports.config = {
  name: "echo",
  version: "3.0.0",
  role: 0,
  hasPrefix: false,
  description: "Ask Echo AI anything",
  usage: "echo [your question]",
  credits: "Ari (API by ARI)",
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const question = args.join(" ").trim();

  if (!question) {
    return api.sendMessage("[❗] Please provide a question.", threadID, messageID);
  }

  const loadingFrames = [
    "⌛ Loading: ▰▱▱",
    "⌛ Loading: ▰▰▱",
    "⌛ Loading: ▰▰▰",
  ];

  api.sendMessage(loadingFrames[0], threadID, async (err, info) => {
    if (err) return;
    let frame = 1;

    const interval = setInterval(() => {
      if (frame < loadingFrames.length) {
        try {
          api.editMessage(loadingFrames[frame], info.messageID);
        } catch {}
        frame++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    try {
      const { data } = await axios.post(`https://echoai-api-3v25.onrender.com/chat`, {
        message: question,
      });

      clearInterval(interval);

      const reply = data.ai?.trim() || "⚠️ Echo AI did not return a response.";

      const finalMessage =
`╔════════════════╗
  ⚙️ 𝗘𝗰𝗵𝗼 𝗔𝗜 : created by ARI
╚════════════════╝

${reply}

━━━━━━━━━━━━━━━━━━`;

      try {
        api.editMessage(finalMessage, info.messageID);
      } catch {
        api.sendMessage(finalMessage, threadID, messageID);
      }

    } catch (error) {
      clearInterval(interval);
      console.error("Echo AI Command Error:", error.response?.data || error.message);
      const errMsg = "❌ Error: " + (error.response?.data?.error || error.message);

      try {
        api.editMessage(errMsg, info.messageID);
      } catch {
        api.sendMessage(errMsg, threadID, messageID);
      }
    }
  });
};
