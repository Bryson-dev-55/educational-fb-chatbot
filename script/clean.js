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

const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "clean",
  aliases: ["cl"],
  credits: "Vern",
  version: "2.0",
  cooldown: 0,
  role: 0,
  hasPrefix: false,
  description: "Help to clean cache and event/cache folder",
  commandCategory: "system",
  usages: "{p}{n}",
};

module.exports.run = async function ({ api, event }) {
  const cacheFolderPath = path.join(__dirname, 'cache');
  const tmpFolderPath = path.join(__dirname, 'event/cache');

  api.sendMessage({ body: formatFont('Cleaning cache on script folders...'), attachment: null }, event.threadID, () => {
    const cleanFolder = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        if (files.length > 0) {
          files.forEach(file => {
            const filePath = path.join(folderPath, file);
            fs.unlinkSync(filePath);
          });
        }
      }
    };

    cleanFolder(cacheFolderPath);
    cleanFolder(tmpFolderPath);

    api.sendMessage({ body: formatFont('cache and event/cache folders cleaned successfully!') }, event.threadID);
  });
};