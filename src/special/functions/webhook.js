module.exports = {
    helpf: '(name | avatar | message) (manage webhooks/messages only)',
    desc: 'Creates a webhook with the name and avatar specified that will send the desired message.',
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let { splitKeyFunc, fetchPingPerms } = poopy.functions
        let globaldata = poopy.globaldata
        let tempdata = poopy.tempdata
        let data = poopy.data
        let config = poopy.config
        let { DiscordTypes, Discord } = poopy.modules
        let bot = poopy.bot

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 4 })
        var name = split[0] ?? ''
        var avatar = split[1] ?? ''
        var message = split[2] ?? ''
        var keepAttachments = split[3] ?? ''
        var allBlank = true

        if (tempdata[msg.guild.id][msg.channel.id].shut) return ''

        if (globaldata.shit.find(id => id === msg.author.id)) return 'shit'

        if (data.guildData[msg.guild.id].members[msg.author.id].coolDown) {
            if ((data.guildData[msg.guild.id].members[msg.author.id].coolDown - Date.now()) > 0 &&
                tempdata[msg.author.id].cooler !== msg.id) {
                return `Calm down! Wait more ${(data.guildData[msg.guild.id].members[msg.author.id].coolDown - Date.now()) / 1000} seconds.`
            } else {
                data.guildData[msg.guild.id].members[msg.author.id].coolDown = false
            }
        }

        tempdata[msg.author.id].cooler = msg.id

        if (!opts.ownermode && tempdata[msg.author.id][msg.id].execCount >= 1 && data.guildData[msg.guild.id].chaincommands == false && !(msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot)) return 'You can\'t chain commands in this server.'
        if (!opts.ownermode && tempdata[msg.author.id][msg.id].execCount >= config.commandLimit * ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot) ? 5 : 1)) return `Number of commands to run at the same time must be smaller or equal to **${config.commandLimit * ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot) ? 5 : 1)}**!`
        tempdata[msg.author.id][msg.id].execCount++

        data.guildData[msg.guild.id].members[msg.author.id].coolDown = (data.guildData[msg.guild.id].members[msg.author.id].coolDown || Date.now()) + 2500 / ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID) ? 5 : 1)

        if (
            msg.channel.type === Discord.ChannelType.PublicThread ||
            msg.channel.type === Discord.ChannelType.PrivateThread ||
            msg.channel.type === Discord.ChannelType.AnnouncementThread
        ) {
            return 'Webhooks can\'t be used here.'
        }

        for (var i = 0; i < name.length; i++) {
            var letter = name[i]
            if (letter !== ' ') {
                allBlank = false
            }
        }

        if (allBlank) {
            return 'Invalid name.'
        }

        var payload = {
            content: message,
            username: name,
            avatarURL: avatar,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }

        if (keepAttachments && data.guildData[msg.guild.id].webhookAttachments) {
            var attachments = msg.attachments.map(attachment => new Discord.AttachmentBuilder(attachment.url, attachment.name))
            var embeds = msg.embeds.filter(embed => embed.data.type === 'rich')
            var stickers = msg.stickers
                .filter(sticker => sticker.format != 3)
                .map(sticker => new Discord.AttachmentBuilder(`https://media.discordapp.net/stickers/${sticker.id}.${sticker.format == 4 ? "gif" : "png"}?size=160`))

            payload.files = attachments.concat(stickers)
            payload.embeds = embeds
        }

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageWebhooks) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id) || isBot) {
            var webhooks = tempdata[msg.guild.id][msg.channel.id].webhooks ?? await msg.channel.fetchWebhooks().catch(() => { })
            tempdata[msg.guild.id][msg.channel.id].webhooks = webhooks

            if (webhooks?.size) {
                var findWebhook = webhooks.find(webhook => bot.user === webhook.owner)
                if (findWebhook) {
                    await findWebhook.send(payload).catch(() => { })
                    return ''
                }
            }

            var createdWebhook = await msg.channel.createWebhook({ name: 'Poopyhook', avatar: 'https://cdn.discordapp.com/attachments/760223418968047629/835923489834664056/poopy2.png' }).catch(() => { })
            if (!createdWebhook) {
                return 'I need the manage webhooks permission for this command!'
            } else {
                msg.channel.fetchWebhooks().then(webhooks => tempdata[msg.guild.id][msg.channel.id].webhooks = webhooks).catch(() => { })
                await createdWebhook.send(payload).catch(() => { })
            }
        } else {
            return 'You need to have the manage webhooks/messages permission to execute that!'
        }

        return ''
    },
    attemptvalue: 10
}