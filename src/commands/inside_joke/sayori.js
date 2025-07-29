module.exports = {
    name: ['sayori'],
    args: [{ "name": "phraseChoice", "required": false, "specifarg": false, "orig": "[phraseChoice]" }],
    execute: async function (msg, args) {
        let poopy = this
        let bot = poopy.bot
        let { generateSayori, fetchPingPerms, sendWebhook } = poopy.functions

        var fixedchoice = args[1];

        var sayori = bot.users.fetch('758638862590803968')
        if (sayori?.catch) sayori = await sayori.catch(() => { })

        if (!sayori) {
            await msg.channel.send("She was not found.").catch(() => { })
            return
        }

        var option = generateSayori(msg, fixedchoice)
        var optiontext
        if (option.pings === true) {
            optiontext = '<@' + msg.author.id + '> ' + option.text
        } else {
            optiontext = option.text
        }

        if (msg.nosend) return optiontext

        var botmsg = await sendWebhook(msg, {
            content: optiontext,
            username: sayori.displayName,
            avatarURL: sayori.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })

        if (botmsg) {
            if (option.edit) {
                var editTimeout = setTimeout(() => {
                    if (option.pings === true) {
                        botmsg.delete().catch(() => { })
                        webhook.send({
                            content: '<@' + msg.author.id + '> ' + option.edit + ' ⁽ᵉᵈᶦᵗᵉᵈ⁾',
                            username: sayori.displayName,
                            avatarURL: sayori.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                    } else {
                        botmsg.delete().catch(() => { })
                        webhook.send({
                            content: option.edit + ' ⁽ᵉᵈᶦᵗᵉᵈ⁾',
                            username: sayori.displayName,
                            avatarURL: sayori.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                    }
                    clearTimeout(editTimeout)
                }, 3000)
            }
        } else {
            botmsg = await msg.reply({
                content: optiontext,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })

            if (botmsg) {
                if (option.edit) {
                    var editTimeout = setTimeout(() => {
                        if (option.pings === true) {
                            botmsg.edit({
                                content: '<@' + msg.author.id + '> ' + option.edit,
                                allowedMentions: {
                                    parse: fetchPingPerms(msg)
                                }
                            }).catch(() => { })
                        } else {
                            botmsg.edit({
                                content: option.edit,
                                allowedMentions: {
                                    parse: fetchPingPerms(msg)
                                }
                            }).catch(() => { })
                        }
                        clearTimeout(editTimeout)
                    }, 3000)
                }
            }
        }

        return optiontext
    },
    help: { name: 'sayori [phraseChoice]', value: 'no not sayori ai' },
    cooldown: 2500,
    type: 'Inside Joke'
}