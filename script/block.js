let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || "User";
  } catch (error) {
    console.log(error);
    return "User";
  }
}

module.exports.config = {
  name: "blockuser",
  version: "1.0.0",
  role: 2,
  credits: "Vern",
  description: "Block a user",
  hasPrefix: true,
  commandCategory: "Admin",
  usages: "{p}{n} @mention, reply, senderID",
  aliases: ["block", "ban"],
  usage: "{p}{n} @mention, reply, senderID",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args, admin }) => {
  const eventSenderID = event.senderID.toString();
  if (!admin.includes(eventSenderID)) {
    return api.sendMessage(formatFont("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗺𝖺𝗇𝖽."), event.threadID, event.messageID);
  }

  const { mentions, messageReply, threadID, messageID } = event;
  const mentionID = args[0];

  if (!mentionID && !messageReply) {
    return api.sendMessage(formatFont("Please mention the user you want to block."), threadID, messageID);
  }

  if (mentionID) {
    api.sendMessage(formatFont("🛡️ | You have been blocked."), mentionID);
    api.sendMessage(formatFont(`🚫 | ${await getUserName(api, mentionID)} has been blocked successfully.`), threadID, messageID);
    api.changeBlockedStatus(mentionID, true);
  } else if (messageReply) {
    const replySenderID = messageReply.senderID;
    api.sendMessage(formatFont("🛡️ | You have been blocked."), replySenderID);
    api.sendMessage(formatFont(`🚫 | ${await getUserName(api, replySenderID)} has been blocked successfully.`), threadID, messageID);
    api.changeBlockedStatus(replySenderID, true);
  }
};