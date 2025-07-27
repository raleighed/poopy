module.exports = {
    name: ['setstatus', 'ss'],
    args: [{ "name": "type", "required": true, "specifarg": false, "orig": "<type (Streaming, Watching, Playing, Listening or Competing)>", "autocomplete": [
        'Playing',
        'Listening',
        'Watching',
        'Streaming',
        'Competing'
    ] }, { "name": "statusMessage", "required": true, "specifarg": false, "orig": "<statusMessage>" }, { "name": "permanent", "required": false, "specifarg": true, "orig": "[-permanent]" }],
    execute: async function (msg, args, opts) {
        let poopy = this
        let config = poopy.config
        let { getOption, infoPost, fetchPingPerms } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let bot = poopy.bot
        let vars = poopy.vars

        var ownerid = config.ownerids.find(id => id == msg.author.id);
        if (ownerid === undefined && !opts.ownermode) {
            await msg.reply('Owner only!').catch(() => { })
            return
        } else {
            var permanent = !!getOption(args, 'permanent', { splice: true, dft: false })

            if (args[1] === undefined) {
                await msg.reply('What is the status type?! (Available: **Playing**, **Listening**, **Watching**, **Streaming**, **Competing**)').catch(() => { })
                return;
            }

            if (args[2] === undefined) {
                await msg.reply('What is the status message?!').catch(() => { })
                return;
            }

            if (args[1] === 'Playing' || args[1] === 'Listening' || args[1] === 'Watching' || args[1] === 'Streaming' || args[1] === 'Competing') {
                var saidMessage = args.slice(2).join(' ')
                await msg.channel.sendTyping().catch(() => { })
                infoPost(`Status changed to ${args[1].toLowerCase() + ' ' + ((args[1] === "Competing" && 'in ') || (args[1] === "Listening" && 'to ') || '') + saidMessage}`)
                bot.user.setPresence({
                    status: 'online',
                    activities: [
                        {
                            name: saidMessage + ` | ${config.globalPrefix}help`,
                            type: DiscordTypes.ActivityType[args[1]],
                            url: 'https://www.youtube.com/watch?v=LDQO0ALm0gE'
                        }
                    ],
                })
                vars.statusChanges = permanent;
                if (!msg.nosend) await msg.reply({
                    content: `Poopy\'s status set to: **${saidMessage} (${args[1]})**`,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                return `Poopy\'s status set to: **${saidMessage} (${args[1]})**`
            }
            else {
                await msg.reply({
                    content: `Invalid status type: **${args[2]}** (Available: **Playing**, **Listening**, **Watching**, **Streaming**, **Competing**)`,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
            }
        };
    },
    help: {
        name: 'setstatus/ss <type (Streaming, Watching, Playing, Listening or Competing)> <statusMessage> [-permanent]',
        value: 'Allows Poopy to have a custom status.\n' +
            'Example usage: p:setstatus Streaming you, idiot. -permanent'
    },
    cooldown: 2500,
    type: 'Owner'
}