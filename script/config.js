const fs = require("fs");

module.exports.config = {
  name: "config",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "fixed by ari",
  description: "Facebook config menu",
  commandCategory: "system",
  usages: "[config]",
  cooldowns: 5,
};

function extractPostID(link) {
  let match = link.match(/(?:story_fbid=|fbid=|\/posts\/|\/permalink\/)(\d+)/);
  return match ? match[1] : null;
}

module.exports.run = async function({ api, event }) {
  const { threadID, senderID } = event;

  const menu = `⚙️ Config Menu

👤 Profile
1. Change Bio
2. Change Nickname
3. Change Avatar
4. Avatar Shield (on/off)

💬 Messaging
5. Pending Messages
6. Unread Messages
7. Spam Messages
8. Send Message

📝 Posts
9. Create Post
10. Delete Post
11. Comment on Post
12. React to Post
13. Create Note

👥 Friends
14. Add Friend
15. Accept Friend Request
16. Decline Friend Request
17. Unfriend
18. Block User
19. Unblock User

🚪 System
20. Logout

➡️ Use: reply with a number`;

  api.sendMessage(menu, threadID, (err, info) => {
    if (err) return console.error(err);
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "menu"
    });
  });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, senderID, body } = event;

  if (handleReply.author != senderID) return;

  switch (handleReply.type) {
    case "menu": {
      switch (body) {
        case "1":
          api.sendMessage("✏️ Enter new bio:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "bio" })
          );
          break;
        case "2":
          api.sendMessage("✏️ Enter new nickname:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "nickname" })
          );
          break;
        case "3":
          api.sendMessage("📷 Send new avatar image:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "avatar" })
          );
          break;
        case "4":
          api.sendMessage("🔒 Toggle avatar shield (on/off):", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "avatar_shield" })
          );
          break;

        // MESSAGING
        case "5":
          api.sendMessage("📥 Showing pending messages...", threadID);
          break;
        case "6":
          api.sendMessage("📨 Showing unread messages...", threadID);
          break;
        case "7":
          api.sendMessage("🚫 Showing spam messages...", threadID);
          break;
        case "8":
          api.sendMessage("✉️ Enter userID + message:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "send_msg" })
          );
          break;

        // POSTS
        case "9":
          api.sendMessage("📝 Enter post content:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "create_post" })
          );
          break;
        case "10":
          api.sendMessage("❌ Enter post link to delete:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "delete_post" })
          );
          break;
        case "11":
          api.sendMessage("💬 Enter post link + comment:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "comment_post" })
          );
          break;
        case "12":
          api.sendMessage("❤️ Enter post link:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "react_post" })
          );
          break;
        case "13":
          api.sendMessage("📝 Enter note content:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "note" })
          );
          break;

        // FRIENDS
        case "14":
          api.sendMessage("👤 Enter userID to add friend:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "add_friend" })
          );
          break;
        case "15":
          api.sendMessage("✅ Enter userID to accept friend request:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "accept_friend" })
          );
          break;
        case "16":
          api.sendMessage("❌ Enter userID to decline friend request:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "decline_friend" })
          );
          break;
        case "17":
          api.sendMessage("🚫 Enter userID to unfriend:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "unfriend" })
          );
          break;
        case "18":
          api.sendMessage("⛔ Enter userID to block:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "block" })
          );
          break;
        case "19":
          api.sendMessage("✅ Enter userID to unblock:", threadID, (e, info) =>
            global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "unblock" })
          );
          break;

        // SYSTEM
        case "20":
          api.sendMessage("🚪 Logging out...", threadID);
          break;

        default:
          api.sendMessage("❌ Invalid option.", threadID);
      }
      break;
    }

    // ---------------- PROFILE ----------------
    case "bio":
      api.changeBio(body, () =>
        api.sendMessage(`✅ Bio updated to: ${body}`, threadID)
      );
      break;

    case "nickname":
      api.changeNickname(body, threadID, senderID, () =>
        api.sendMessage(`✅ Nickname changed to: ${body}`, threadID)
      );
      break;

    case "avatar":
      api.changeAvatar(event.attachments[0].url, () =>
        api.sendMessage("✅ Avatar updated!", threadID)
      );
      break;

    case "avatar_shield":
      api.changeAvatarShield(body.toLowerCase() === "on", () =>
        api.sendMessage(`✅ Avatar shield ${body.toLowerCase() === "on" ? "enabled" : "disabled"}`, threadID)
      );
      break;

    // ---------------- MESSAGING ----------------
    case "send_msg": {
      let [id, ...msg] = body.split(" ");
      api.sendMessage(msg.join(" "), id, () =>
        api.sendMessage(`✅ Message sent to ${id}`, threadID)
      );
      break;
    }

    // ---------------- POSTS ----------------
    case "create_post":
      api.createPost(body, () =>
        api.sendMessage("✅ Post created!", threadID)
      );
      break;

    case "delete_post": {
      let postID = extractPostID(body);
      if (!postID) return api.sendMessage("❌ Invalid post link.", threadID);
      api.deletePost(postID, () =>
        api.sendMessage("✅ Post deleted!", threadID)
      );
      break;
    }

    case "comment_post": {
      let parts = body.split(" ");
      let link = parts.shift();
      let comment = parts.join(" ");
      let postID = extractPostID(link);
      if (!postID) return api.sendMessage("❌ Invalid post link.", threadID);
      api.commentPost(postID, comment, () =>
        api.sendMessage("💬 Commented!", threadID)
      );
      break;
    }

    case "react_post": {
      let postID = extractPostID(body);
      if (!postID) return api.sendMessage("❌ Invalid post link.", threadID);
      api.sendMessage("Choose reaction:\n1. 👍\n2. ❤️\n3. 😆\n4. 😮\n5. 😢\n6. 😡", threadID, (e, info) =>
        global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "react_choose", postID })
      );
      break;
    }

    case "react_choose": {
      let postID = handleReply.postID;
      let reacts = ["👍", "❤️", "😆", "😮", "😢", "😡"];
      let react = reacts[parseInt(body) - 1];
      if (!react) return api.sendMessage("❌ Invalid choice.", threadID);
      api.setPostReaction(react, postID, () =>
        api.sendMessage(`✅ Reacted with ${react}`, threadID)
      );
      break;
    }

    case "note":
      api.createNote(body, () =>
        api.sendMessage("✅ Note created!", threadID)
      );
      break;

    // ---------------- FRIENDS ----------------
    case "add_friend":
      api.addFriend(body, () =>
        api.sendMessage(`✅ Friend request sent to ${body}`, threadID)
      );
      break;

    case "accept_friend":
      api.acceptFriendRequest(body, () =>
        api.sendMessage(`✅ Friend request from ${body} accepted`, threadID)
      );
      break;

    case "decline_friend":
      api.declineFriendRequest(body, () =>
        api.sendMessage(`❌ Friend request from ${body} declined`, threadID)
      );
      break;

    case "unfriend":
      api.removeFriend(body, () =>
        api.sendMessage(`🚫 Unfriended ${body}`, threadID)
      );
      break;

    case "block":
      api.blockUser(body, () =>
        api.sendMessage(`⛔ Blocked ${body}`, threadID)
      );
      break;

    case "unblock":
      api.unblockUser(body, () =>
        api.sendMessage(`✅ Unblocked ${body}`, threadID)
      );
      break;
  }
};
