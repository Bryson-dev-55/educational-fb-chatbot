module.exports.config = {
        name: 'help',
        version: '1.0.1',
        role: 0,
        hasPrefix: false,
        aliases: ['help'],
        description: "Beginner's guide",
        usage: "Help [page] or [command]",
        credits: 'ARI',
};

module.exports.run = async function ({
        api,
        event,
        enableCommands,
        args,
        Utils,
        prefix
}) {
        const input = args[0];
        try {
                const eventCommands = enableCommands[1].handleEvent;
                const commands = enableCommands[0].commands;

                const perPage = 10;
                const totalPages = Math.ceil(commands.length / perPage);
                const page = !isNaN(input) ? Math.max(1, Math.min(parseInt(input), totalPages)) : 1;
                const start = (page - 1) * perPage;
                const end = start + perPage;

                if (!input || !isNaN(input)) {
                        let helpMessage = `✦ ━━ ✦ 𝑩𝑶𝑻 𝑯𝑬𝑳𝑷 ✦ ━━ ✦\n\n`;
                        helpMessage += `📜 Command List (Page ${page}/${totalPages}) 📜\n\n`;

                        for (let i = start; i < Math.min(end, commands.length); i++) {
                                helpMessage += `╭〔${i + 1}〕 ${prefix}${commands[i]}\n╰───────────────\n`;
                        }

                        helpMessage += `\n➡️ Type: ${prefix}help [page] to view other pages\n`;
                        helpMessage += `➡️ Type: ${prefix}help [command] for details`;

                        if (page === 1 && eventCommands.length) {
                                helpMessage += `\n\n📌 Event List:\n`;
                                eventCommands.forEach((eventCommand, index) => {
                                        helpMessage += `╭〔E${index + 1}〕 ${prefix}${eventCommand}\n╰───────────────\n`;
                                });
                        }

                        return api.sendMessage(helpMessage, event.threadID, event.messageID);
                } else {
                        const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) =>
                                key.includes(input?.toLowerCase())
                        )?.[1];

                        if (command) {
                                const {
                                        name,
                                        version,
                                        role,
                                        aliases = [],
                                        description,
                                        usage,
                                        credits,
                                        cooldown,
                                        hasPrefix
                                } = command;

                                const roleMessage =
                                        role !== undefined
                                                ? (role === 0
                                                        ? '➛ Permission: user'
                                                        : role === 1
                                                                ? '➛ Permission: admin'
                                                                : role === 2
                                                                        ? '➛ Permission: thread Admin'
                                                                        : role === 3
                                                                                ? '➛ Permission: super Admin'
                                                                                : '')
                                                : '';

                                const aliasesMessage = aliases.length ? `➛ Aliases: ${aliases.join(', ')}\n` : '';
                                const descriptionMessage = description ? `➛ Description: ${description}\n` : '';
                                const usageMessage = usage ? `➛ Usage: ${usage}\n` : '';
                                const creditsMessage = credits ? `➛ Credits: ${credits}\n` : '';
                                const versionMessage = version ? `➛ Version: ${version}\n` : '';
                                const cooldownMessage = cooldown ? `➛ Cooldown: ${cooldown} second(s)\n` : '';

                                const message = `「 Command Info 」\n\n➛ Name: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
                                return api.sendMessage(message, event.threadID, event.messageID);
                        } else {
                                return api.sendMessage('❌ Command not found.', event.threadID, event.messageID);
                        }
                }
        } catch (error) {
                console.log(error);
        }
};

module.exports.handleEvent = async function ({ api, event, prefix }) {
        const { threadID, messageID, body } = event;
        const message = prefix ? 'This is my prefix: ' + prefix : "🗨️ 𝗠𝘆 𝗽𝗿𝗲𝗳𝗶𝘅 𝗶𝘀...";
        if (body?.toLowerCase().startsWith('prefix')) {
                api.sendMessage(message, threadID, messageID);
        }
};
