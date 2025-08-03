module.exports = {
    name: ['battlestats', 'userstats'],
    args: [{
        "name": "user", "required": false, "specifarg": false, "orig": "{user}",
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
    }],
    execute: async function (msg, args) {
        let poopy = this
        let bot = poopy.bot
        let data = poopy.data
        let vars = poopy.vars
        let config = poopy.config
        let { getLevel, dataGather, fetchPingPerms } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })

        args[1] = args[1] ?? ''

        var member = await bot.users.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => { }) ?? msg.author

        if (!member) {
            await msg.reply({
                content: `Invalid user ID: **${args[1]}**`,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            return
        }

        if (!data.userData[member.id]) {
            data.userData[member.id] = !config.testing && process.env.MONGOOSE_URL && await dataGather.userData(config.database, member.id).catch(() => { }) || {}
        }

        for (var stat in vars.battleStats) {
            if (data.userData[member.id][stat] === undefined) {
                data.userData[member.id][stat] = vars.battleStats[stat]
            }
        }
        if (!data.userData[member.id].battleSprites) data.userData[member.id].battleSprites = {}

        var levelData = getLevel(data.userData[member.id].exp)

        var battleStats = [
            {
                name: "Health",
                value: `${data.userData[member.id].health.toFixed(1).replace(/\.0+$/, "")} HP`,
                inline: true
            },
            {
                name: "Max Health",
                value: `${data.userData[member.id].maxHealth.toFixed(1).replace(/\.0+$/, "")} HP`,
                inline: true
            },
            {
                name: "Level",
                value: String(levelData.level),
                inline: true
            },
            {
                name: "Experience",
                value: `${levelData.exp.toFixed(1).replace(/\.0+$/, "")}/${levelData.required} XP`,
                inline: true
            },
            {
                name: "Total Experience",
                value: `${data.userData[member.id].exp.toFixed(1).replace(/\.0+$/, "")} XP`,
                inline: true
            },
            {
                name: "Pobucks",
                value: `${data.userData[member.id].bucks} P$`,
                inline: true
            },
            {
                name: "Kills",
                value: String(data.userData[member.id].kills),
                inline: true
            },
            {
                name: "Deaths",
                value: String(data.userData[member.id].deaths),
                inline: true
            },
            {
                name: "Attack",
                value: String(data.userData[member.id].attack),
                inline: true
            },
            {
                name: "Defense",
                value: String(data.userData[member.id].defense),
                inline: true
            },
            {
                name: "Accuracy",
                value: String(data.userData[member.id].accuracy),
                inline: true
            },
            {
                name: "Loot",
                value: String(data.userData[member.id].loot),
                inline: true
            },
        ]

        var sendObject = {
            embeds: [{
                title: `${member.displayName}\'s Stats`,
                color: 0x472604,
                thumbnail: {
                    url: member.displayAvatarURL({
                        dynamic: true, size: 1024, extension: 'png'
                    })
                },
                footer: {
                    icon_url: bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                    text: bot.user.displayName
                },
                fields: battleStats
            }],
            content: `**${member.displayName}'s Stats**\n\n${battleStats.map(s => `**${s.name}**: ${s.value}`).join('\n')}`,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }
        if (config.textEmbeds) delete sendObject.embeds
        else delete sendObject.content
        if (!msg.nosend) await msg.reply(sendObject).catch(() => { })

        return `**${member.displayName}'s Stats**\n\n${battleStats.map(s => `**${s.name}**: ${s.value}`).join('\n')}`
    },
    help: {
        name: 'battlestats/userstats {user}',
        value: "Shows the user's battle stats."
    },
    cooldown: 2500,
    type: 'Battling'
}