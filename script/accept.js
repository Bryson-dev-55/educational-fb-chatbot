module.exports.config = {
  name: "accept",
  version: "1.0.0",
  credits: "BLACK",
  role: [1,3],
  hasPrefix: true,
  description: "Accept friend requests by UID",
  usage: "[uid]",
  cooldown: 0
};

module.exports.run = async function({ api, event, args }) {
  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } })
  };

  const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
  const parsed = JSON.parse(response);
  const listRequest = parsed.data?.viewer?.friending_possibilities?.edges || [];

  if (listRequest.length === 0) {
    return api.sendMessage("No friend requests pending.", event.threadID);
  }

  if (args[0]) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
    form.doc_id = "3147613905362928";

    const success = [];
    const failed = [];

    for (const uid of args) {
      try {
        form.variables = JSON.stringify({
          ...JSON.parse(JSON.stringify(form.variables)),
          input: {
            ...JSON.parse(JSON.stringify(form.variables)).input,
            friend_requester_id: uid
          }
        });

        const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);

        if (JSON.parse(response).errors) {
          failed.push(uid);
        } else {
          success.push(uid);
        }
      } catch (e) {
        failed.push(uid);
      }
    }

    api.sendMessage(
      `✅ Successfully accepted friend requests from ${success.length} users:\n${success.join("\n")}${
        failed.length > 0 ? `\n❌ Failed with ${failed.length} users:\n${failed.join("\n")}` : ""
      }`,
      event.threadID
    );
    return;
  }

  let msg = "📎 Friend Requests List:\n\n";
  let i = 0;
  for (const user of listRequest) {
    i++;
    msg += `\n${i}. Name: ${user.node.name}\nID: 
${user.node.id}\nUrl: ${user.node.url.replace("www.facebook", "fb")}\n`;
  }

  msg += "\nTo accept, use: accept uid";
  api.sendMessage(msg, event.threadID);
};
