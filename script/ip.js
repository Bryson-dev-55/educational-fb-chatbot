const axios = require("axios");

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
  name: "ip",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["ipinfo", "checkip"],
  credits: "Vern",
  description: "Check IP address information.",
  usages: "ip [address]",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!args.join("")) {
    api.sendMessage(formatFont("❌ | Enter your IP address!"), threadID, messageID);
    return;
  }

  const ipAddress = args.join(" ");
  try {
    const response = await axios.get(`http://ipapi.co/${ipAddress}/json`);
    const data = response.data;

    if (!data.ip) {
      api.sendMessage(formatFont("❌ | This IP address could not be found!"), threadID, messageID);
    } else {
      const ipInfo = `
        =====✅ IP Information ✅=====
        🌍 IP Address: ${data.ip}
        🔗 Network: ${data.network}
        🌐 IP Version: ${data.version}
        🏙 City: ${data.city}
        🏞 Region: ${data.region} (Code: ${data.region_code})
        🏛 Country: ${data.country_name} (${data.country})
        🌍 ISO Country Code: ${data.country_code_iso3}
        🏙 Capital: ${data.country_capital}
        🌐 Country TLD: ${data.country_tld}
        🌎 Continent Code: ${data.continent_code}
        🇪🇺 In EU: ${data.in_eu ? "Yes" : "No"}
        📮 Postal Code: ${data.postal}
        📍 Latitude: ${data.latitude}
        📍 Longitude: ${data.longitude}
        ⏰ Timezone: ${data.timezone}
        🕒 UTC Offset: ${data.utc_offset}
        ☎️ Calling Code: ${data.country_calling_code}
        💵 Currency: ${data.currency} (${data.currency_name})
        🗣 Languages: ${data.languages}
        🗺 Country Area: ${data.country_area} km²
        👥 Population: ${data.country_population}
        📡 ASN: ${data.asn}
        🏢 Organization: ${data.org}
      `;
      api.sendMessage(formatFont(ipInfo.trim()), threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(formatFont(`❌ | Error: ${error.message}`), threadID, messageID);
  }
};