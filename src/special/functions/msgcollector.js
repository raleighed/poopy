module.exports = {
    helpf: '(collectPhrase<_msg|resettimer()|stop(sendFinishPhrase)|source(...)> | timeout | finishPhrase<_collected>) (manage messages permission only)',
    desc: 'Creates a message collector that collects any messages sent in the channel, within the timeout.\n' +
        '**_msg** - Keyword used when a message is sent\n' +
        "**resettimer()** - Resets the collector's timer\n" +
        "**stop(sendFinishPhrase)** - Stops the collector from running, sends the finishPhrase if sendFinishPhrase isn't blank.\n" +
        "**source(...)** - Perform a keyword execution using the variables of the user who made the message collector.\n" +
        '**_collected** - Used when the collector stops running, containing all collected messages.',
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let { splitKeyFunc, getKeywordsFor, dmSupport, fetchPingPerms, deleteMsgData } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let config = poopy.config
        let data = poopy.data
        let bot = poopy.bot
        let tempdata = poopy.tempdata

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 3 })
        var collectphrase = split[0] ?? ''
        split[1] = await getKeywordsFor(split[1] ?? '', msg, isBot, opts).catch(() => { }) || ''
        var timeout = isNaN(Number(split[1])) ? 10 : Number(split[1]) <= 1 ? 1 : (!opts.ownermode && Number(split[1]) >= 60) ? 60 : Number(split[1]) || 10
        var finishphrase = split[2] ?? ''
        var channel = msg.channel
        var guildid = msg.guild.id
        var channelid = channel.id
        var authorid = msg.author.id

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.roles.cache.find(role => role.name.match(/mod|dev|admin|owner|creator|founder|staff/ig)) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || authorid === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id) || isBot || authorid == bot.user.id) {
            if (tempdata[guildid][channelid][authorid].messageCollector) {
                tempdata[guildid][channelid][authorid].messageCollector.stop()
                delete tempdata[guildid][channelid][authorid].messageCollector
            }

            var filter = m => (config.allowbotusage || (data.guildData[msg.guild.id].chaos && !m.webhookId) || !m.author.bot) && m.author.id != bot.user.id
            var collected = []
            var collector = channel.createMessageCollector({ filter, time: timeout * 1000 })

            tempdata[guildid][channelid][authorid].messageCollector = collector

            collector.on('collect', async m => {
                try {
                    dmSupport(m)

                    if (tempdata[msg.guild.id][msg.channel.id].shut) return
                    var content = await getKeywordsFor(m.content ?? '', m, false).catch((e) => console.log(e)) ?? m.content

                    var valOpts = { ...opts }
                    valOpts.extrakeys._msg = {
                        func: async () => {
                            return content
                        }
                    }
                    valOpts.extrafuncs.resettimer = {
                        func: async () => {
                            collector.resetTimer()
                            return ''
                        }
                    }
                    valOpts.extrafuncs.stop = {
                        func: async (matches) => {
                            var word = matches[1]
                            collector.stop(word ? 'time' : 'user')
                            return ''
                        }
                    }
                    valOpts.extrafuncs.source = {
                        func: async (matches) => {
                            var word = matches[1]
                            var content = await getKeywordsFor(word, msg, true, opts).catch((e) => console.log(e)) ?? word
                            return content
                        },
                        raw: true
                    }

                    var collect = await getKeywordsFor(collectphrase, m, true, valOpts).catch((e) => console.log(e)) ?? ''

                    collected.push(content)

                    await channel.send({
                        content: collect,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                } catch (_) { }

                deleteMsgData(m)
            })

            collector.on('end', async (_, reason) => {
                try {
                    if (tempdata[msg.guild.id][msg.channel.id].shut) return
                    delete tempdata[guildid][channelid][authorid].messageCollector
                    if (reason === 'time') {
                        var valOpts = { ...opts }
                        valOpts.extrakeys._collected = {
                            func: async () => {
                                return collected.join(' | ')
                            }
                        }

                        var finishphrasek = await getKeywordsFor(finishphrase, msg, isBot, valOpts).catch(() => { }) ?? ''

                        await channel.send({
                            content: finishphrasek,
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                    }
                } catch (_) { }

                deleteMsgData(msg)
            })

            return ''
        } else {
            return 'You need the manage messages permission to use this function.'
        }
    },
    raw: true,
    potential: {
        keys: { _msg: {}, _collected: {} },
        funcs: { resettimer: {}, stop: {}, source: {} }
    },
    attemptvalue: 10
}