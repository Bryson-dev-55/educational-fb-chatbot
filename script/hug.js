const axios = require("axios");
const fs = require("fs");

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

module.exports.config = {
  name: "hug",
  version: "1.0",
  role: 0,
  credits: "Vern",
  description: "Hug someone using their profile picture.",
  cooldown: 5,
  hasPrefix: true,
  usage: "[reply/@mention/uid]",
};

module.exports.run = async function({ api, event, args }) {
  const { threadID: tid, messageID: mid, senderID: userID } = event;
  let targetID;

  if (args.join().indexOf("@") !== -1) {
    targetID = Object.keys(event.mentions)[0];
  } else if (event.type === "message_reply") {
    targetID = event.messageReply.senderID;
  } else if (args[0]) {
    targetID = args[0];
  } else {
    return api.sendMessage(formatFont("❌ | Please reply to a target, mention a user, or provide a UID."), tid, mid);
  }

  const outputPath = __dirname + `/cache/hug_${userID}_${targetID}.png`;

  try {
    const data1 = await api.getUserInfo(userID);
    const name1 = data1[userID].name;

    const data2 = await api.getUserInfo(targetID);
    const name2 = data2[targetID].name;

    const hugURL = `https://api-canvass.vercel.app/hug?one=${userID}&two=${targetID}`;

    const response = await axios({
      method: "GET",
      url: hugURL,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: formatFont(`${name1} warmly hugged ${name2}! 🤗`),
        attachment: fs.createReadStream(outputPath),
      }, tid, () => fs.unlinkSync(outputPath), mid);
    });

    writer.on("error", err => {
      throw new Error("Failed to save image.");
    });

  } catch (err) {
    api.sendMessage(formatFont(`Error: ${err.message}`), tid, mid);
  }
};