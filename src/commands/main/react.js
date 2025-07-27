module.exports = {
    name: ['react'],
    args: [{ "name": "emojis", "required": true, "specifarg": false, "orig": "<emojis>" }, { "name": "messageid", "required": false, "specifarg": false, "orig": "{messageid}" }],
    execute: async function (msg, args) {
        let poopy = this
        let { DiscordTypes } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        if (args[1] === undefined) {
            await msg.reply('Where are the arguments?!').catch(() => { })
            return;
        }
        var saidEmojis = args[1];
        var saidMessage = args[2];

        if (saidMessage === undefined) {
            saidMessage = msg.id
        }

        if (saidEmojis) {
            var emojisArray = saidEmojis.split(',')
            var messageToReact = msg.channel.messages.fetch(saidMessage)
            if (messageToReact.catch) messageToReact = await messageToReact.catch(async () => {
                    await msg.reply({
                        content: 'Invalid message ID: **' + saidMessage + '**',
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    return
                })

            if (!messageToReact) return

            for (var emoji of emojisArray) {
                var err = false
                messageToReact.react(emoji).catch(() => err = true)
                if (err) {
                    await msg.reply({
                        content: 'Invalid emoji: **' + emoji + '**',
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    return
                }
            }

            if (msg.type === DiscordTypes.InteractionType.ApplicationCommand && !msg.replied) {
                await msg.reply({ content: 'Successfully reacted.', ephemeral: true }).catch(() => { })
            }
        };
    },
    help: {
        name: 'react <emojis> {messageid}',
        value: 'React to a message inside the channel with an emoji. (each emoji should be separated with ",")'
    },
    type: 'Main'
}