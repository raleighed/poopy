module.exports = {
    name: ['cleverbot', 'respond'],
    args: [
        {
            "name": "message",
            "required": false,
            "specifarg": false,
            "orig": "{message}"
        },
        {
            "name": "continuous",
            "required": false,
            "specifarg": true,
            "orig": "[-continuous]"
        },
        {
            "name": "clear",
            "required": false,
            "specifarg": true,
            "orig": "[-clear]"
        }
    ],
    execute: async function (msg, args) {
        let poopy = this
        let { cleverbot, dmSupport, getKeywordsFor, fetchPingPerms, deleteMsgData } = poopy.functions
        let tempdata = poopy.tempdata
        let bot = poopy.bot

        var continuous = getOption(args, 'continuous', { n: 0, splice: true, dft: false })
        var clear = getOption(args, 'clear', { n: 0, splice: true, dft: false })

        var channel = msg.channel
        var guildid = msg.guild.id
        var channelid = channel.id
        var authorid = msg.author.id

        var saidMessage = args.slice(1).join(' ')
        if (saidMessage) {
            var resp = await cleverbot(saidMessage, msg, clear).catch(err => {
                channel.send({
                    content: err.stack,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
            })

            if (resp) {
                if (!msg.nosend) channel.send({
                    content: resp,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                return resp
            }
        } else if (!msg.nosend) {
            if (!continuous && !args[1]) {
                channel.send('What is the message to respond to?!').catch(() => { })
                return
            }
            channel.send('Hello, I will respond to your messages now.').catch(() => { })
        }

        channel.sendTyping().catch(() => { })

        if (!msg.nosend && continuous) {
            if (tempdata[guildid][channelid][authorid].messageCollector) {
                tempdata[guildid][channelid][authorid].messageCollector.stop()
                delete tempdata[guildid][channelid][authorid].messageCollector
            }

            var filter = m => !m.author.bot && m.author.id != bot.user.id && m.author.id === msg.author.id
            var collector = channel.createMessageCollector({ filter, time: 30000 })

            tempdata[guildid][channelid][authorid].messageCollector = collector

            collector.on('collect', async m => {
                try {
                    dmSupport(m)

                    if (tempdata[msg.guild.id][msg.channel.id].shut) return

                    var content = await getKeywordsFor(m.content ?? '', m, false).catch(() => { }) ?? m.content

                    collector.resetTimer()

                    var resp = await cleverbot(content, m).catch(err => {
                        channel.send({
                            content: err.stack,
                            allowedMentions: {
                                parse: fetchPingPerms(m)
                            }
                        }).catch(() => { })
                    })
                    if (resp) {
                        channel.send({
                            content: resp,
                            allowedMentions: {
                                parse: fetchPingPerms(m)
                            }
                        }).catch(() => { })
                    }
                } catch (_) { }

                deleteMsgData(m)
            })

            collector.on('end', async (_, reason) => {
                try {
                    if (tempdata[msg.guild.id][msg.channel.id].shut) return
                    delete tempdata[guildid][channelid][authorid].messageCollector
                    if (reason === 'time') {
                        channel.send({
                            content: 'I\'m running out of time...',
                            allowedMentions: {
                                parse: fetchPingPerms(m)
                            }
                        }).catch(() => { })
                    }
                } catch (_) { }
            })
        }
    },
    help: {
        name: 'cleverbot/respond {message} [-continuous] [-clear]',
        value: "Poopy responds to your message(s) with Cleverbot's AI. Try it yourself at https://www.cleverbot.com/"
    },
    type: 'Generation'
}