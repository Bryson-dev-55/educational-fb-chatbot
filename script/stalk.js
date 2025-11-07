function convert(time) {
	var date = new Date(`${time}`);
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var formattedDate = `${day < 10 ? "0" + day : day}` + "/" + `${month < 10 ? "0" + month : month}` + "/" + year + "||" + `${hours < 10 ? "0" + hours : hours}` + ":" + `${minutes < 10 ? "0" + minutes : minutes}` + ":" + `${seconds < 10 ? "0" + seconds : seconds}`;
	return formattedDate;
}

module.exports.config = {
	name: "stalk",
	credits: "Vern",
	version: "1.5",
	cooldown: 10,
	role: 0,
	usages: "[reply/uid/@mention]",
	hasPrefix: false,
	description: "Get info using uid/mention/reply to a message",
	aliases: ["st"]
};

module.exports.run = async function({ api, event, args }) {
	const request = require("request");
	const fs = require("fs");
	let path = __dirname + `/cache/info.png`;

	if (args.join().indexOf('@') !== -1) {
		var id = Object.keys(event.mentions);
	} else {
		var id = args[0] || event.senderID;
	}

	if (event.type == "message_reply") {
		var id = event.messageReply.senderID;
	}

	try {
		api.getUserInfo(id, (err, userInfo) => {
			if (err) {
				return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
			}

			const user = userInfo[id];
			const avatar = `https://graph.facebook.com/${id}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
			const name = user.name;
			const first_name = user.firstName;
			const link_profile = user.profileUrl;
			const gender = user.gender;
			const birthday = user.isBirthday ? convert(new Date()) : "N/A";
			const hometown = user.hometown || "N/A";
			const locale = user.locale || "N/A";
			const relationship_status = user.relationshipStatus || "N/A";
			const follower = user.followersCount || "N/A";

			let cb = function() {
				api.sendMessage({
					body: `•——𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡——•
Name: ${name}
First name: ${first_name}
Profile link: ${link_profile}
Gender: ${gender}
Relationship Status: ${relationship_status}
Birthday: ${birthday}
Follower(s): ${follower}
Hometown: ${hometown}
Locale: ${locale}
•——𝗘𝗡𝗗——•`,
					attachment: fs.createReadStream(path)
				}, event.threadID, () => fs.unlinkSync(path), event.messageID);
			};

			request(encodeURI(avatar)).pipe(fs.createWriteStream(path)).on("close", cb);
		});
	} catch (err) {
		api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
	}
};