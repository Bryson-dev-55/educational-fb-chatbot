module.exports.config = {
  name: "outall",
  version: "1.0.0",
  role: 2,
  credits: "Vern",
  description: "Remove from all groups except the current group",
  usages: "{p}outall",
  hasPrefix: true,
  cooldown: 5
};

module.exports.run = async ({ api, event, args, admin }) => {
  try {
    const senderID = event.senderID.toString();
    if (!admin.includes(senderID)) {
      return api.sendMessage("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽.", event.threadID, event.messageID);
    }

    const list = await api.getThreadList(100, null, ["INBOX"]);

    list.forEach(async (item) => {
      if (item.isGroup && item.threadID !== event.threadID) {
        await api.removeUserFromGroup(api.getCurrentUserID(), item.threadID);
      }
    });

    await api.sendMessage('𝖲𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝗋𝖾𝗆𝗈𝗏𝖾𝖽 𝖿𝗋𝗈𝗆 𝖺𝗅𝗅 𝗈𝗍𝗁𝖾𝗋 𝗀𝗋𝗈𝗎𝗉𝗌.', event.threadID);
  } catch (err) {
    console.error(err);
  }
};