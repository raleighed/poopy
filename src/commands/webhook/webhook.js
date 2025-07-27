module.exports = {
    name: ['webhook',
        'customhook',
        'customwebhook'],
    args: [{
        "name": "user",
        "required": false,
        "specifarg": false,
        "orig": "[user]",
        "autocomplete": async function (interaction) {
            let poopy = this
            let { data, config } = poopy
            let { dataGather } = poopy.functions

            if (!data.guildData[interaction.guild.id]) {
                data.guildData[interaction.guild.id] = !config.testing && process.env.MONGOOSE_URL && await dataGather.guildData(config.database, interaction.guild.id).catch((e) => console.log(e)) || {}
            }

            var memberData = data.guildData[interaction.guild.id].allMembers ?? {}
            var memberKeys = Object.keys(memberData).sort((a, b) => memberData[b].messages - memberData[a].messages)

            return memberKeys.map(id => {
                return { name: memberData[id].username, value: id }
            })
        }
    },
    {
        "name": "text",
        "required": true,
        "specifarg": false,
        "orig": "\"<text>\""
    },
    {
        "name": "image",
        "required": true,
        "specifarg": false,
        "orig": "<image>"
    }],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let vars = poopy.vars
        let data = poopy.data
        let { DiscordTypes } = poopy.modules
        let { dataGather, fetchPingPerms } = poopy.functions

        args[1] = args[1] ?? ' '

        var member = await msg.guild.members.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => { }) ?? msg.member

        if (!member) {
            await msg.reply({
                content: `Invalid user ID: **${args[1]}**`,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            return
        }

        if (!data.guildData[msg.guild.id].members[member.id]) {
            data.guildData[msg.guild.id].members[member.id] = !config.testing && process.env.MONGOOSE_URL && await dataGather.memberData(config.database, msg.guild.id, msg.author.id).catch(() => { }) || {}
        }

        if (!data.guildData[msg.guild.id].members[member.id].custom) {
            data.guildData[msg.guild.id].members[member.id].custom = false
        }

        if (data.guildData[msg.guild.id].members[member.id].custom === false) {
            if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageWebhooks) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                var saidMessage = args.slice(1).join(' ')
                var symbolReplacedMessage
                vars.symbolreplacements.forEach(symbolReplacement => {
                    symbolReplacement.target.forEach(target => {
                        symbolReplacedMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
                    })
                })
                var matchedTextes = symbolReplacedMessage.match(/"([\s\S]*?)"/)
                if (!matchedTextes) {
                    await msg.reply('Where\'s the name?!').catch(() => { })
                    return
                }
                if (!vars.validUrl.test(args[args.length - 1])) {
                    await msg.reply('Where\'s the avatar?!').catch(() => { })
                    return
                }
                var name = matchedTextes[1]
                var allBlank = true

                for (var i = 0; i < name.length; i++) {
                    var letter = name[i]
                    if (letter !== ' ') {
                        allBlank = false
                    }
                }

                if (allBlank) {
                    await msg.reply('Invalid name.').catch(() => { })
                    return
                }
                var avatar = args[args.length - 1]

                data.guildData[msg.guild.id].members[member.id].custom = {
                    name: allBlank ? '⠀' : name,
                    avatar: avatar
                }
                if (!msg.nosend) await msg.reply({
                    content: member.displayName + ` is now ${name}.`,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                return member.displayName + ` is now ${name}.`
            } else {
                await msg.reply('You need to have the manage webhooks/messages permission to execute that!').catch(() => { })
                return;
            }
        } else {
            if (!msg.nosend) await msg.reply({
                content: member.displayName + ` is not ${data.guildData[msg.guild.id].members[member.id].custom.name}.`,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            data.guildData[msg.guild.id].members[member.id].custom = false
            return member.displayName + ` is not ${data.guildData[msg.guild.id].members[member.id].custom.name}.`
        }
    },
    help: {
        name: 'webhook/customhook/customwebhook [user] "<text>" <image> (manage webhooks/messages permission only)',
        value: 'Turns someone into the webhook you specified.'
    },
    cooldown: 2500,
    perms: ['Administrator',
        'ManageWebhooks',
        'ManageMessages'],
    type: 'Webhook'
}