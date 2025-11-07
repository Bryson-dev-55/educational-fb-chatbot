module.exports.config = {
  name: "antiout",
  version: "1.0.0"
};
module.exports.handleEvent = async ({
  event,
  api
}) => {
  if (event.logMessageData?.leftParticipantFbId === api.getCurrentUserID()) return;
  if (event.logMessageData?.leftParticipantFbId) {
    const info = await api.getUserInfo(event.logMessageData?.leftParticipantFbId);
    const {
      name
    } = info[event.logMessageData?.leftParticipantFbId];
    api.addUserToGroup(event.logMessageData?.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(`𝚄𝚗𝚊𝚋𝚕𝚎 𝚝𝚘 𝚛𝚎-𝚊𝚍𝚍 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 ${name} 𝚝𝚘 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙 𝚗𝚒 𝚋𝚕𝚘𝚌𝚔 𝚊𝚔𝚘 𝚗𝚐 𝚑𝚊𝚢𝚘𝚙:(`, event.threadID);
      } else {
        api.sendMessage(`𝙷𝙰𝙷𝙰𝙷𝙰𝙷𝙰 𝚃𝙰𝙽𝙶𝙰, 𝚠𝚊𝚕𝚊 𝚔𝚊𝚗𝚐 𝚝𝚊𝚔𝚊𝚜 𝚔𝚊𝚢 🤖 | 𝙴𝚌𝚑𝚘 𝙰𝙸 ${name} 𝚔𝚞𝚗𝚐 𝚍 𝚕𝚊𝚗𝚐 𝚔𝚒𝚝𝚊 𝚕𝚊𝚋 𝚍 𝚔𝚒𝚝𝚊 𝚒𝚋𝚊𝚋𝚊𝚕𝚒𝚔 （￣へ￣）`, event.threadID);
      }
    });
  }
};
