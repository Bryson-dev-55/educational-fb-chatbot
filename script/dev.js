const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "developer",
  version: "1.0.0",
  role: 2,
  hasPrefix: true,
  description: "Unknown",
  usage: "404",
  credits: "Developer",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const allowedUIDs = ["61577110900436", "61550264923277"]; // authorized users
  const senderID = event.senderID;

  if (!allowedUIDs.includes(senderID)) {
    return api.sendMessage("❌ You are not allowed to use this command.", event.threadID, event.messageID);
  }

  const sub = args.shift();
  if (!sub) return api.sendMessage("📌 Hello Developer!", event.threadID, event.messageID);

  switch (sub.toLowerCase()) {
    case "avatar": {
      const messageReply = event.messageReply;
      let imageUrl;

      if (messageReply?.attachments?.length > 0 && messageReply.attachments[0].type === "photo") {
        imageUrl = messageReply.attachments[0].url;
      } else {
        if (args.length === 0) {
          return api.sendMessage("⚠️ Provide image URL or reply to an image.\n📌 Usage: developer avatar <url>", event.threadID, event.messageID);
        }
        imageUrl = args[0];
      }

      try {
        const response = await axios({
          url: imageUrl,
          method: "GET",
          responseType: "stream",
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const imagePath = path.join(cacheDir, `avatar_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        await new Promise((res, rej) => {
          writer.on("finish", res);
          writer.on("error", rej);
        });

        const imageStream = fs.createReadStream(imagePath);

        api.changeAvatar(imageStream, "", null, async (err) => {
          await fs.unlink(imagePath).catch(() => {});
          if (err) return api.sendMessage("❌ Failed to change avatar.", event.threadID, event.messageID);
          return api.sendMessage("✅ Bot avatar changed successfully!", event.threadID, event.messageID);
        });
      } catch (e) {
        return api.sendMessage("❌ Invalid image or URL.", event.threadID, event.messageID);
      }
      break;
    }

    case "out": {
      try {
        if (!args[0]) {
          return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
        }
        if (!isNaN(args[0])) {
          return api.removeUserFromGroup(api.getCurrentUserID(), args[0]);
        }
      } catch (err) {
        return api.sendMessage(err.message, event.threadID, event.messageID);
      }
      break;
    }

    case "post": {
      const message = args.join(" ");
      const messageReply = event.messageReply;
      const attachments = messageReply?.attachments || event.attachments || [];
      const files = [];

      try {
        for (const attachment of attachments) {
          const filePath = path.join(__dirname, "cache", attachment.filename);
          const res = await axios({ url: attachment.url, method: "GET", responseType: "stream" });
          await fs.ensureDir(path.dirname(filePath));
          const writer = fs.createWriteStream(filePath);
          res.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          files.push(fs.createReadStream(filePath));
        }

        const postData = { body: message };
        if (files.length > 0) postData.attachment = files;

        api.createPost(postData)
          .then((url) => api.sendMessage(`✅ Post created!\n🔗 ${url || "No URL returned."}`, event.threadID, event.messageID))
          .catch((error) => {
            const errorUrl = error?.data?.story_create?.story?.url;
            if (errorUrl) return api.sendMessage(`✅ Post created!\n🔗 ${errorUrl}\n⚠️ With warnings`, event.threadID, event.messageID);

            let errMsg = error.message || "❌ Unknown error.";
            api.sendMessage(`❌ Error creating post:\n${errMsg}`, event.threadID, event.messageID);
          })
          .finally(() => {
            for (const file of files) {
              if (file.path) fs.unlink(file.path).catch(() => {});
            }
          });

      } catch (err) {
        console.error("Post error:", err);
        return api.sendMessage("❌ Failed to create post.", event.threadID, event.messageID);
      }
      break;
    }

    case "changebio": {
      const newBio = args.join(" ").trim();
      if (!newBio) return api.sendMessage("⚠️ Provide text for new bio.\nUsage: developer changebio <text>", event.threadID, event.messageID);
      try {
        await api.changeBio(newBio);
        return api.sendMessage("✅ Bio changed successfully!", event.threadID, event.messageID);
      } catch (err) {
        return api.sendMessage("❌ Failed to change bio.", event.threadID, event.messageID);
      }
    }

    default:
      return api.sendMessage(`❓ Unknown subcommand "${sub}". Available: avatar, post, out, changebio`, event.threadID, event.messageID);
  }
};
