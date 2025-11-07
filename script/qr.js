const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'qr',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['qrcode'],
  description: 'Generate a QR code from text',
  usage: 'qr [your text]',
  credits: 'Vern',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "❌ Please provide text to generate QR code. Example: `qr hello world`",
      threadID,
      messageID
    );
  }

  const text = encodeURIComponent(args.join(" "));
  const apiUrl = `https://kaiz-apis.gleeze.com/api/qrcode-generator?text=${text}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
  const outputPath = path.join(__dirname, 'cache', 'qrcode.png');

  api.sendMessage("📲 Generating QR code, please wait...", threadID, async () => {
    try {
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, Buffer.from(response.data));

      await api.sendMessage(
        {
          body: '✅ Here is your QR Code:',
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => {
          fs.unlinkSync(outputPath);
        },
        messageID
      );
    } catch (error) {
      console.error("QR API Error:", error?.response?.data || error.message);
      api.sendMessage(
        "❌ Failed to generate QR code. Please try again later.",
        threadID,
        messageID
      );
    }
  });
};