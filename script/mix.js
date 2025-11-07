const axios = require('axios');
const fs = require('fs');

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
    name: "mix",
    version: "1.0.0",
    role: 0,
    hasPrefix: true,
    description: "Mix two emojis.",
    usage: "emojimix [emoji1] [emoji2]",
    credits: "Developer",
    cooldown: 0,
};

function isValidEmoji(emoji) {
    return emoji.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/);
}

module.exports.run = async ({ api, event, args }) => {
    try {
        const { threadID, messageID } = event;

        const time = new Date();
        const timestamp = time.toISOString().replace(/[:.]/g, "-");
        const pathPic = __dirname + '/cache/' + `${timestamp}_emojimix.png`;

        if (args.length < 2) {
            api.sendMessage(formatFont("Please provide two emojis to mix."), threadID, messageID);
            return;
        }

        const emoji1 = args[0];
        const emoji2 = args[1];

        if (!isValidEmoji(emoji1) || !isValidEmoji(emoji2)) {
            api.sendMessage(formatFont("Invalid emojis provided. Please provide valid emojis."), threadID, messageID);
            return;
        }

        const { data } = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
        
        const picture = data.results[0].url;

        const getPicture = (await axios.get(picture, { responseType: 'arraybuffer' })).data;

        fs.writeFileSync(pathPic, Buffer.from(getPicture, 'utf-8'));

        api.sendMessage({ body: '', attachment: fs.createReadStream(pathPic) }, threadID, () => fs.unlinkSync(pathPic), messageID);

    } catch (error) {
        api.sendMessage(formatFont("Can't combine emojis."), event.threadID, event.messageID);
    }
};