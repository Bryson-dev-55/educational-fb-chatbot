module.exports.config = {
  name: "spam",
  version: "1.0",
  author: "kim/zed", // Converted by ari
  cooldown: 5,
  role: 2
};

module.exports.run = async function ({ api, event, args }) {
  const amount = parseInt(args[0]);
  const message = args.slice(1).join(" ");

  if (isNaN(amount) || !message) {
    return api.sendMessage(
      "❌ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚞𝚜𝚊𝚐𝚎.\n\n𝙲𝚘𝚛𝚛𝚎𝚌𝚝: {𝚙}𝚜𝚙𝚊𝚖 [ 𝚊𝚖𝚘𝚞𝚗𝚝 ] [ 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 ]",
      event.threadID,
      event.messageID
    );
  }

  let spamText = "";
  for (let i = 0; i < amount; i++) {
    spamText += message + "\n";
  }

  api.sendMessage(spamText, event.threadID, event.messageID);
};
