module.exports = {
    name: ['userinfo', 'whois'],
    args: [{
        "name": "user", "required": true, "specifarg": false, "orig": "<user>",
        "autocomplete": async function (interaction) {
            let poopy = this
            let { data, config } = poopy
            let { dataGather } = poopy.functions

            if (!data.guildData[interaction.guild.id]) {
                data.guildData[interaction.guild.id] = !config.testing && process.env.MONGODB_URL && await dataGather.guildData(config.database, interaction.guild.id).catch((e) => console.log(e)) || {}
            }

            var memberData = data.guildData[interaction.guild.id].allMembers ?? {}
            var memberKeys = Object.keys(memberData).sort((a, b) => memberData[b].messages - memberData[a].messages)

            return memberKeys.map(id => {
                return { name: memberData[id].username, value: id }
            })
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let bot = poopy.bot
        let { DiscordTypes } = poopy.modules
        let config = poopy.config

        args[1] = args[1] ?? ' '

        var member = await msg.guild.members.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => { }) ??
            await bot.users.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => { }) ??
            msg.member

        var user = await (member.user ?? member).fetch(true)

        var avatar = member.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }) ?? user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' })
        var banner = user.bannerURL({ dynamic: true, size: 1024, extension: 'png' })

        var urls = [`[Avatar URL](${avatar})`]
        if (banner) urls.push(`[Banner URL](${banner})`)

        var infoEmbed = {
            author: {
                name: `${member.displayName.replace(/\@/g, '@‌')} (${user.tag})`,
                icon_url: avatar
            },
            description: urls.join(' '),
            color: 0x472604,
            thumbnail: {
                url: avatar
            },
            footer: {
                icon_url: bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                text: bot.user.displayName
            },
            fields: []
        }

        var status = {
            online: '🟢 Online',
            idle: '🌙 Idle',
            dnd: '⛔ Do Not Disturb',
            offline: '⚫ Offline/Invisible'
        }

        var badgeEmojis = {
            ActiveDeveloper: `<:ActiveDeveloper:1055895046844579871>`,
            Boost1Month: `<:Boost1Month:1035668044661391371>`,
            Boost2Month: `<:Boost2Month:1035668018195345419>`,
            Boost3Month: `<:Boost3Month:1035668021143937094>`,
            Boost6Month: `<:Boost6Month:1035668019747246080>`,
            Boost9Month: `<:Boost9Month:1035668042555871252>`,
            Boost12Month: `<:Boost12Month:1035668030279122964>`,
            Boost15Month: `<:Boost15Month:1035668014458228847>`,
            Boost18Month: `<:Boost18Month:1035668024113516605>`,
            Boost24Month: `<:Boost24Month:1035668022595174581>`,
            Bot: `<:Bot1:1035902581542764575><:Bot2:1035902583056908479>`,
            BotHTTPInteractions: `<:BotHTTPInteractions:1035675213523845252>`,
            BugHunterLevel1: `<:BugHunter:1035668016572157952>`,
            BugHunterLevel2: `<:BugHunterLevel2:1035668040966230170>`,
            CertifiedModerator: `<:CertifiedModerator:1055891693800521791>`,
            GuildOwner: `<:GuildOwner:1035668034934820966>`,
            Hypesquad: `<:HypesquadEvent:1035668031889748018>`,
            HypeSquadOnlineHouse1: `<:HypeSquadBravery:1035668028932771840>`,
            HypeSquadOnlineHouse2: `<:HypeSquadBrilliance:1035668026957246555>`,
            HypeSquadOnlineHouse3: `<:HypeSquadBalance:1035668037971497040>`,
            Nitro: `<:Nitro:1035668012797276180>`,
            Partner: `<:Partner:1035670800386248825>`,
            PremiumEarlySupporter: `<:NitroEarlySupporter:1035668025292099615>`,
            Quarantined: `<:Quarantined:1035673851503325224>`,
            Spammer: `<:Spammer:1035673850085638285>`,
            Staff: `<:Staff:1035668039338840144>`,
            System: `<:System1:1035901984814944337><:System2:1035901986433925230><:System3:1035901988560457739><:System4:1035901990003290192>`,
            TeamPseudoUser: `<:TeamPseudoUser:1035673000244170832>`,
            VerifiedBot: `<:VerifiedBot1:1035902602577186878><:VerifiedBot2:1035902604489797733><:VerifiedBot3:1035902606029107220>`,
            VerifiedDeveloper: `<:VerifiedDeveloper:1055892568099008552>`
        }

        var userFlags = user.flags.toArray()
        var flags = []

        if (user.id == msg.guild.ownerId) flags.push('GuildOwner')
        if (member.premiumSince) {
            flags.push('Nitro')

            var now = new Date()
            var months = (now.getFullYear() - member.premiumSince.getFullYear()) * 12 - now.getMonth() + member.premiumSince.getMonth()
            var tiers = [24, 18, 15, 12, 9, 6, 3, 2, 1]

            for (var tier of tiers) {
                if (months >= tier) {
                    flags.push(`Boost${tier}Month`)
                    break
                }
            }
        }
        if (user.system) flags.push('System')
        else if (user.bot) {
            var verifiedBot = userFlags.indexOf('VerifiedBot')
            if (verifiedBot > -1) userFlags.splice(verifiedBot, 1)
            flags.push(verifiedBot > -1 ? 'VerifiedBot' : 'Bot')
        }
        flags = flags.concat(userFlags)

        infoEmbed.fields.push({
            name: 'ID',
            value: `\`${user.id}\``,
            inline: true
        })
        infoEmbed.fields.push({
            name: 'Created',
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
            inline: true
        })
        if (member.joinedTimestamp) infoEmbed.fields.push({
            name: 'Joined',
            value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
            inline: true
        })
        if (flags.length) infoEmbed.fields.push({
            name: 'Badges',
            value: flags.map(b => !config.self && badgeEmojis[b] || b).join(' '),
            inline: true
        })

        if (member.presence) {
            infoEmbed.fields.push({
                name: 'Status',
                value: status[member.presence.status],
                inline: true
            })

            if (member.presence.activities && member.presence.activities.length) {
                var emoji
                var text

                for (var activity of member.presence.activities) {
                    if (activity.emoji && !emoji) emoji = activity.emoji.toString()
                    if ((activity.state || activity.name) && !text) text = activity.type == DiscordTypes.ActivityType.Custom ? activity.state : `${DiscordTypes.ActivityType[activity.type]} ${activity.type === DiscordTypes.ActivityType.Competing && 'in ' || activity.type === DiscordTypes.ActivityType.Listening && 'to ' || ''}**${activity.name}**`
                }

                var activity
                if (emoji && text) activity = `${emoji} ${text}`
                else activity = emoji ?? text

                infoEmbed.fields.push({
                    name: 'Activity',
                    value: activity,
                    inline: true
                })
            }
        }

        if (member.roles) {
            infoEmbed.fields.push({
                name: 'Roles',
                value: member.roles.cache.sort((a, b) => b.rawPosition - a.rawPosition).map(role => role.toString()).join(' '),
                inline: true
            })
        }

        if (!msg.nosend) {
            if (config.textEmbeds) msg.reply({
                content: `${infoEmbed.author.name}\n\n${infoEmbed.description}\n${infoEmbed.fields.map(p => `**${p.name}**: ${p.value}`).join('\n')}`,
                allowedMentions: {
                    parse: ['users']
                }
            }).catch(() => { })
            else msg.reply({
                embeds: [infoEmbed]
            }).catch(() => { })
        }
        return `${infoEmbed.author.name}\n\n${infoEmbed.description}\n${infoEmbed.fields.map(p => `**${p.name}**: ${p.value}`).join('\n')}`
    },
    help: {
        name: 'userinfo/whois <user>',
        value: "Shows a user's info."
    },
    cooldown: 2500,
    type: 'Main'
}
