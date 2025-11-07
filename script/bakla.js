const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "bakla",
  version: "1.2.2",
  author: "Vern",
  aliases: ["gay"],
  cooldown: 5,
  role: 0,
  hasPrefix: true,
  description: "Randomly finds a 'gay' in groupchat.",
};

module.exports.run = async function ({ event, api }) {
  function getRandomUserID(ids) {
    const randomIndex = Math.floor(Math.random() * ids.length);
    return ids[randomIndex];
  }

  function formatFont(text) {
    const fontMapping = {
      a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
      n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
      A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
      N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
    };

    let formattedText = "";
    for (const char of text) {
      formattedText += fontMapping[char] || char;
    }

    return formattedText;
  }

  try {
    const groupId = event.threadID;
    const groupInfo = await api.getThreadInfo(groupId);
    const friends = groupInfo.participantIDs.filter(userId => !groupInfo.nicknames[userId]);

    if (friends.length === 0) {
      return api.sendMessage(formatFont("No eligible users found in this group."), event.threadID);
    }

    const randomUserID = getRandomUserID(friends);
    const userInfo = await api.getUserInfo(randomUserID);
    const realName = userInfo[randomUserID].name;
    const apiURL = `https://api-canvass.vercel.app/rainbow?userid=${randomUserID}`;
    const outputPath = path.join(__dirname, `/cache/gay_${randomUserID}.png`);

    const response = await axios({
      method: 'get',
      url: apiURL,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: formatFont(`Look, I found a gay: ${realName} 😆`),
        attachment: fs.createReadStream(outputPath)
      }, event.threadID, () => {
        fs.unlinkSync(outputPath);
      });
    });

    writer.on("error", (err) => {
      console.error("Error saving the image:", err.message);
      api.sendMessage(formatFont("An error occurred while saving the image."), event.threadID);
    });

  } catch (error) {
    console.error("Error generating image:", error.message);
    api.sendMessage(formatFont("An error occurred while generating the image."), event.threadID);
  }
};