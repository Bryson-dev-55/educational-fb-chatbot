module.exports.config = {
  name: "autodownload",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Vern",
  description: "Auto download from TikTok, YouTube, Facebook, IG, X, etc.",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  const fs = require("fs");
  const axios = require("axios");

  const API_BASE = "https://neoaz.is-a.dev";
  
  const input = event.body;
  if (!input) return;

  const platforms = {
    "x.com": "Twitter/X",
    "twitter.com": "Twitter/X", 
    "pin.it": "Pinterest",
    "pinterest.com": "Pinterest",
    "capcut.com": "CapCut",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "reddit.com": "Reddit",
    "snapchat.com": "Snapchat",
    "facebook.com": "Facebook",
    "fb.watch": "Facebook",
    "tiktok.com": "TikTok",
    "vt.tiktok.com": "TikTok",
    "vm.tiktok.com": "TikTok", 
    "instagram.com": "Instagram",
    "ig.me": "Instagram",
    "threads.net": "Threads"
  };

  const matched = Object.keys(platforms).find(key => input.includes(key));
  if (!matched) return;

  const endpoint = `${API_BASE}/api/alldl?url=${encodeURIComponent(input)}`;

  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    api.sendTypingIndicator(event.threadID, true);

    const res = await axios.get(endpoint, {
      timeout: 30000
    });
    
    console.log("API Response:", res.data); // For debugging

    let videoUrl;
    const data = res.data;

    // Unified API response handling for the new endpoint
    if (data.videoUrl) {
      videoUrl = data.videoUrl;
    } else if (data.url) {
      videoUrl = data.url;
    } else if (data.downloadUrl) {
      videoUrl = data.downloadUrl;
    } else if (data.download_url) {
      videoUrl = data.download_url;
    } else if (data.mediaUrl) {
      videoUrl = data.mediaUrl;
    } else if (data.video && data.video.url) {
      videoUrl = data.video.url;
    } else if (data.downloadLinks && data.downloadLinks[0] && data.downloadLinks[0].url) {
      videoUrl = data.downloadLinks[0].url;
    } else if (data.result && data.result.video_url) {
      videoUrl = data.result.video_url;
    } else if (data.mp4 && data.mp4.url) {
      videoUrl = data.mp4.url;
    } else if (Array.isArray(data.videos) && data.videos[0] && data.videos[0].url) {
      videoUrl = data.videos[0].url;
    }

    if (!videoUrl) {
      console.log("Full API response for debugging:", JSON.stringify(data, null, 2));
      return api.sendMessage("❌ Failed to retrieve video URL from the API response.", event.threadID, event.messageID);
    }

    // Send downloading message (auto delete after 10 seconds)
    const downloadingMsg = await api.sendMessage("📥 Downloading video...", event.threadID);
    
    const fileName = `${Date.now()}_${platforms[matched]}.mp4`;
    const filePath = __dirname + "/" + fileName;

    // Download the video
    const videoResponse = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const file = fs.createWriteStream(filePath);
    videoResponse.data.pipe(file);

    file.on("finish", () => {
      file.close(() => {
        // Auto delete downloading message
        if (downloadingMsg && downloadingMsg.messageID) {
          api.unsendMessage(downloadingMsg.messageID);
        }
        
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        
        api.sendMessage({
          body: `✅ Video downloaded successfully!\n\n📱 Platform: ${platforms[matched]}\n🔗 Source: ${matched}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, (err) => {
          // Clean up file after sending
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          if (err) {
            api.sendMessage("❌ Error sending video file.", event.threadID, event.messageID);
          }
        });
      });
    });

    file.on("error", (err) => {
      console.error("File write error:", err);
      if (downloadingMsg && downloadingMsg.messageID) {
        api.unsendMessage(downloadingMsg.messageID);
      }
      api.sendMessage("❌ Error saving video file.", event.threadID, event.messageID);
    });

  } catch (error) {
    console.error("Download error:", error);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    
    let errorMessage = "❌ Download failed: ";
    if (error.response) {
      errorMessage += `API Error (${error.response.status}) - ${error.response.data?.message || 'Unknown error'}`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage += "Request timeout - Please try again";
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage += "API server not found";
    } else {
      errorMessage += error.message;
    }
    
    api.sendMessage(errorMessage, event.threadID, event.messageID);
  }
};
