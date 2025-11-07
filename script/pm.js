module.exports.config = {
  name: "pm",
  version: "1.1.0",
  role: 2,
  hasPrefix: true,
  aliases: ["privatemessage"],
  credits: "luffy + converted by ari",
  description: "Send anonymous message to user or thread by ID",
  commandCategory: "box chat",
  usages: "{p}pm [threadID or userID] [message]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (args.length < 2) {
    return api.sendMessage(
      "❌ Wrong usage!\nUse: pm [threadID or userID] [message]",
      event.threadID,
      event.messageID
    );
  }

  const receiverID = args[0]; 
  const message = args.slice(1).join(" ");

  api.sendMessage(
    {
      body: message,
      mentions: [{
        tag: "@pm",
        id: event.senderID
      }]
    },
    receiverID,
    (err) => {
      if (err) {
        return api.sendMessage(
          `⚠️ Failed to send message to ID: ${receiverID}\nError: ${err.error}`,
          event.threadID,
          event.messageID
        );
      }
      api.sendMessage(
        `✅ Sent anonymous message to ID: ${receiverID}\nMessage: "${message}"`,
        event.threadID,
        event.messageID
      );
    }
  );
};
