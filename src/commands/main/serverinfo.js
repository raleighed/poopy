module.exports = {
    name: ['serverinfo', 'guildinfo'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let bot = poopy.bot
        let { Discord } = poopy.modules
        let config = poopy.config

        var icon = msg.guild.iconURL({ dynamic: true, size: 1024, extension: 'png' })
        var banner = msg.guild.bannerURL({ dynamic: true, size: 1024, extension: 'png' })
        var splash = msg.guild.splashURL({ dynamic: true, size: 1024, extension: 'png' })
        var dsplash = msg.guild.discoverySplashURL({ dynamic: true, size: 1024, extension: 'png' })

        var urls = []
        if (icon) urls.push(`[Icon URL](${icon})`)
        if (banner) urls.push(`[Banner URL](${banner})`)
        if (splash) urls.push(`[Splash URL](${splash})`)
        if (dsplash) urls.push(`[Discovery Splash URL](${dsplash})`)

        var infoEmbed = {
            title: msg.guild.name,
            description: urls.join(' '),
            color: 0x472604,
            footer: {
                icon_url: bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                text: bot.user.displayName
            },
            fields: [
                {
                    name: 'ID',
                    value: `\`${msg.guild.id}\``,
                    inline: true
                },
                {
                    name: 'Owner',
                    value: (await bot.users.fetch(msg.guild.ownerId)).tag,
                    inline: true
                },
                {
                    name: 'Created',
                    value: `<t:${Math.floor(msg.guild.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: 'Member Count',
                    value: msg.guild.memberCount.toString(),
                    inline: true
                },
                {
                    name: 'Roles',
                    value: msg.guild.roles.cache.size.toString(),
                    inline: true
                },
                {
                    name: 'Emojis',
                    value: msg.guild.emojis.cache.size.toString(),
                    inline: true
                },
                {
                    name: 'Categories',
                    value: msg.guild.channels.cache.filter(c => c.type == Discord.ChannelType.GuildCategory).size.toString(),
                    inline: true
                },
                {
                    name: 'Text Channels',
                    value: msg.guild.channels.cache.filter(c => c.type == Discord.ChannelType.GuildText || c.type == Discord.ChannelType.GuildNews || c.type == Discord.ChannelType.GuildForum).size.toString(),
                    inline: true
                },
                {
                    name: 'Voice Channels',
                    value: msg.guild.channels.cache.filter(c => c.type == Discord.ChannelType.GuildVoice || c.type == Discord.ChannelType.GuildStageVoice).size.toString(),
                    inline: true
                },
                {
                    name: 'Total Channels',
                    value: msg.guild.channels.cache.size.toString(),
                    inline: true
                },
            ]
        }

        if (icon) infoEmbed.thumbnail = {
            url: icon
        }

        if (msg.guild.afkChannel) infoEmbed.fields.push({
            name: 'AFK Channel',
            value: msg.guild.afkChannel.toString(),
            inline: true
        })
        if (msg.guild.systemChannel) infoEmbed.fields.push({
            name: 'System Channel',
            value: msg.guild.systemChannel.toString(),
            inline: true
        })
        if (msg.guild.publicUpdatesChannel) infoEmbed.fields.push({
            name: 'Public Updates Channel',
            value: msg.guild.publicUpdatesChannel.toString(),
            inline: true
        })
        if (msg.guild.widgetChannel) infoEmbed.fields.push({
            name: 'Widget Channel',
            value: msg.guild.widgetChannel.toString(),
            inline: true
        })
        infoEmbed.fields.push({
            name: 'Boost Level',
            value: msg.guild.premiumTier ? `Level ${msg.guild.premiumTier}` : 'None',
            inline: true
        })
        infoEmbed.fields.push({
            name: 'Verification Level',
            value: Discord.GuildVerificationLevel[msg.guild.verificationLevel].split(/(?=[A-Z])/).join(' '),
            inline: true
        })

        if (!msg.nosend) {
            if (config.textEmbeds) msg.reply({
                content: `${infoEmbed.title}\n\n${infoEmbed.description}\n${infoEmbed.fields.map(p => `**${p.name}**: ${p.value}`).join('\n')}`,
                allowedMentions: {
                    parse: ['users']
                }
            }).catch(() => { })
            else msg.reply({
                embeds: [infoEmbed]
            }).catch(() => { })
        }
        return `${infoEmbed.title}\n\n${infoEmbed.description}\n${infoEmbed.fields.map(p => `**${p.name}**: ${p.value}`).join('\n')}`
    },
    help: {
        name: 'serverinfo/guildinfo',
        value: "Shows info about the server."
    },
    cooldown: 2500,
    type: 'Main'
}