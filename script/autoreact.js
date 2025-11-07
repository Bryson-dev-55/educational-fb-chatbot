const fs = require("fs");

module.exports.config = {
  name: "autoreact",
  version: "3.6.0",
  hasPermssion: 0,
  credits: "Ari",
  description: "autoreact replies",
  commandCategory: "no prefix",
  usages: "noprefix",
  cooldowns: 0
};

module.exports.handleEvent = function({ api, event }) {
  if (!event.body) return;
  const text = event.body.toLowerCase();

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const reactions = [
    { keywords: ["lol","😂","ughh","pagal","mental","oye","love","jani","bc","busy","group","kis","kuta","jan","oh"], emojis: ["😆","🤣","😂"] },
    { keywords: ["death","mar","udas","☹️","hurt","please","pls","😢","😔","🥺","sad"], emojis: ["😢","😭","🥀"] },
    { keywords: ["🥵","umah","💋","kiss","babu","baby","wow","wah","relationship","gf","omg"], emojis: ["😘","😍","😚"] }
  ];

  for (let r of reactions) {
    if (r.keywords.some(word => text.includes(word))) {
      return api.setMessageReaction(pick(r.emojis), event.messageID, () => {}, true);
    }
  }

  const replies = {
    "tite": ["Tite ka nang tite, lika dito subuin mo ’to. 🤣", "Puro ka tite, wala nabang ibang laman yang utak mo?", "bad yan"],
    "umay": ["Umay talaga, wala kang tatay eh 😏", "Ril", "Umay sayo lods 😓"],
    "bot": ["Oo na, bot na kinginamo ka", "Tama na kaka-bot punyeta", "Pwede tama na kaka-bot nakakarindi na eh!! 😠"],
    "robot": ["Sino tinatawag mong robot ha? 🤨", "ANOOOOOOO!!?", "Robot? 🫤"],
    "burat": ["Si Ari pogi, malake burat 💪", "Tingin ako burat", "Burat means tite diba? tingin nga rate ko lang"],
    "kick": ["Ikaw dapat kinikick eh, wala ka namang ambag.", "ikaw dapat kinikick eh wala ka namang dulot sa pinas putanginamo di ka mahal ng magulang mo bobo ka", "sige ganyan ka naman eh, hindi ka na naawa sakin 😞💔"],
    "hahaha": ["Tawang-tawa ampota, saksakin ko ngalangala mo 🔪", "Tawa ng nirebound ba yan?", "Happy?"],
    "hehehe": ["Hehe parang may tinatago ka lods 😏", "Seryoso ka ba o nang-aasar ka lang? 🤨", "Hehehe cute 😂"],
    "hihihi": ["Inlove ba ito?", "Hihihi ampota", "Nakaka-kilig naman yang hihihi mo 😍"],
    "huhuhu": ["Huhuhu parang si Santa Claus ah 🎅", "gawkgawkgawkgawk", "Iyak ba yan? 🤔"]
  };

  if (/\b(ha[^\s]*){2,}\b/i.test(text)) {
    return api.sendMessage(pick(replies["hahaha"]), event.threadID, event.messageID);
  }
  if (/\b(he[^\s]*){2,}\b/i.test(text)) {
    return api.sendMessage(pick(replies["hehehe"]), event.threadID, event.messageID);
  }
  if (/\b(hi[^\s]*){2,}\b/i.test(text)) {
    return api.sendMessage(pick(replies["hihihi"]), event.threadID, event.messageID);
  }
  if (/\b(hu[^\s]*){2,}\b/i.test(text)) {
    return api.sendMessage(pick(replies["huhuhu"]), event.threadID, event.messageID);
  }
  
  if (text.includes("😂") || text.includes("🤣")) {
    return api.sendMessage(pick(replies["hahaha"]), event.threadID, event.messageID);
  }

  for (let key in replies) {
    let regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(text)) {
      return api.sendMessage(pick(replies[key]), event.threadID, event.messageID);
    }
  }
};

module.exports.run = () => {};
