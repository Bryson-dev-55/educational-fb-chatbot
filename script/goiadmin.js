module.exports.config = {
  name: "goiadmin",
  version: "1.0.0",
  hasPermission: 0,
  credits: "AJ/ARI",
  description: "Auto reply kapag binanggit ang pangalan ng admin",
  commandCategory: "autobot",
  usages: "Automatic reply kapag tinawag si admin",
  cooldowns: 2
};

module.exports.handleEvent = async function ({ event, api }) {
  if (!event.body) return;

  const message = event.body.toLowerCase();

  const pattern = /\bari\b/;

  if (pattern.test(message)) {
    const responses = [
      "tangina ano na naman kailangan mo sa owner ko? 🤨",
      "wait mo lang boss, busy pa ata developer ko",
      "Yes? hanap mo pogi kong tropa?",
      "babe nalang itawag mo sa owner ko 😏😏",
      "wag isturbo may kabebetime pa owner ko.",
      "isa pang tawag sa owner ko ipapa-laplap kita sa kanya 🙄",
      "tawag nang tawag eh may kailangan ka ba sa boss ko? 😠😠",
      "anong kailangan mo sa boss ko⁉️",
      "hanap nang hanap sa owner ko gusto mo ba siyang landiin ha??"
    ];
    const randomReply = responses[Math.floor(Math.random() * responses.length)];
    return api.sendMessage(randomReply, event.threadID, event.messageID);
  }
};

module.exports.run = async function () {
  // No run needed, this command works on message events
};
