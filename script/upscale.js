const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'upscale',
  version: '1.0.0',
  role: 0,
  aliases: ['increase'],
  description: 'Upscale an image to a higher resolution',
  usage: '<reply to an image>',
  credits: 'Vern',
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || !messageReply.attachments[0]) {
    return api.sendMessage('❌ Please reply to an image to upscale it!', threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const pathie = path.join(__dirname, 'cache', 'upscaled.jpg');
  const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale?imageUrl=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

  api.sendMessage('🔼 Upscaling the image, please wait...', threadID, async (err, info) => {
    if (err) return;

    try {
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      fs.writeFileSync(pathie, buffer);

      api.sendMessage({
        body: '⬆️ Your image has been upscaled!',
        attachment: fs.createReadStream(pathie),
      }, threadID, () => {
        try { fs.unlinkSync(pathie); } catch (e) {}
      }, messageID);
      
    } catch (error) {
      console.error('Error during upscaling:', error);
      api.editMessage(
        '❌ An error occurred while processing the image. Please try again later.',
        info.messageID
      );
    }
  });
};