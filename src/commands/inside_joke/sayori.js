module.exports = {
    name: ['sayori'],
    args: [{ "name": "phraseChoice", "required": false, "specifarg": false, "orig": "[phraseChoice]" }],
    execute: async function (msg, args) {
        let poopy = this
        let bot = poopy.bot
        let tempdata = poopy.tempdata
        let { generateSayori, fetchPingPerms } = poopy.functions

        var fixedchoice = args[1];

        var sayori = await bot.users.fetch('758638862590803968').catch(() => { })
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

        var botmsg

        var webhooks = tempdata[msg.guild.id][msg.channel.id].webhooks ?? await msg.channel.fetchWebhooks().catch(() => { })
        tempdata[msg.guild.id][msg.channel.id].webhooks = webhooks

        var findWebhook

        if (webhooks?.size) {
            findWebhook = webhooks.find(webhook => bot.user === webhook.owner)
            if (findWebhook) {
                botmsg = await findWebhook.send({
                    content: optiontext,
                    username: sayori.displayName,
                    avatarURL: sayori.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
            }
        }

        findWebhook = await msg.channel.createWebhook({ name: 'Poopyhook', avatar: 'https://cdn.discordapp.com/attachments/760223418968047629/835923489834664056/poopy2.png' }).catch(() => { })
        if (findWebhook) {
            msg.channel.fetchWebhooks().then(webhooks => tempdata[msg.guild.id][msg.channel.id].webhooks = webhooks).catch(() => { })
            botmsg = await findWebhook.send({
                content: optiontext,
                username: sayori.displayName,
                avatarURL: sayori.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
        }

        if (botmsg) {
            if (option.edit) {
                var editTimeout = setTimeout(() => {
                    if (option.pings === true) {
                        botmsg.delete().catch(() => { })
                        findWebhook.send({
                            content: '<@' + msg.author.id + '> ' + option.edit + ' ⁽ᵉᵈᶦᵗᵉᵈ⁾',
                            username: sayori.displayName,
                            avatarURL: sayori.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                    } else {
                        botmsg.delete().catch(() => { })
                        findWebhook.send({
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