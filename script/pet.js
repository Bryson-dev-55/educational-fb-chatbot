const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "pet",
  version: "1.0",
  role: 0,
  credits: "Vern",
  description: "Generate a cute pet meme using someone's profile picture.",
  cooldown: 5,
  hasPrefix: true,
  usage: "[reply/@mention/uid]",
};

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  return text.split('').map(char => fontEnabled && char in fontMapping ? fontMapping[char] : char).join('');
}

module.exports.run = async function ({ api, event, args }) {
  let tid = event.threadID;
  let mid = event.messageID;
  let targetID;

  if (args.join().indexOf("@") !== -1) {
    targetID = Object.keys(event.mentions)[0];
  } else if (event.type === "message_reply") {
    targetID = event.messageReply.senderID;
  } else if (args[0]) {
    targetID = args[0];
  } else {
    return api.sendMessage(formatFont("Please reply to target or mention or provide a uid."), tid, mid);
  }

  const userID = event.senderID;
  const outputPath = __dirname + `/cache/pet_${userID}_${targetID}.gif`;

  try {
    const userInfo = await api.getUserInfo(targetID);
    const name = userInfo[targetID].name;

    let profileURL = `https://api-canvass.vercel.app/profile?uid=${targetID}`;
    let petURL = `https://api.popcat.xyz/pet?image=${profileURL}`;

    const response = await axios({
      url: petURL,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: formatFont(`Here's a cute pet version of ${name}! 🐾💕`),
        attachment: fs.createReadStream(outputPath),
      }, tid, () => fs.unlinkSync(outputPath), mid);
    });

    writer.on('error', (err) => {
      api.sendMessage(formatFont(`Error: ${err.message}`), tid, mid);
    });

  } catch (err) {
    api.sendMessage(formatFont(`Error: ${err.message}`), tid, mid);
  }
};