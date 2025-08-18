module.exports = {
    name: ['battlestats', 'userstats'],
    args: [{
        "name": "user", "required": false, "specifarg": false, "orig": "{user}",
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
        let data = poopy.data
        let vars = poopy.vars
        let config = poopy.config
        let { getLevel, dataGather, fetchPingPerms,
            getShieldById, formatNumberWithPreset } = poopy.functions

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
            data.userData[member.id] = !config.testing && process.env.MONGODB_URL && await dataGather.userData(config.database, member.id).catch(() => { }) || {}
        }

        var userData = data.userData[member.id]

        for (var stat in vars.battleStats) {
            if (userData[stat] === undefined) {
                userData[stat] = vars.battleStats[stat]
            }
        }
        if (!userData.battleSprites) userData.battleSprites = {}

        var levelData = getLevel(userData.exp)
        var equippedShield = getShieldById(userData.shieldEquipped)
        var shieldIsUp = userData.shielded

        var shieldDamageReduction = shieldIsUp
            ? equippedShield && equippedShield.stats.damageReduction
            : 0

        var shieldAttackReduction = shieldIsUp
            ? equippedShield && equippedShield.stats.attackReduction
            : 0

        var damageReductionFormat = vars.shieldStatsDisplayInfo.find(
            displayInfo => displayInfo.name === 'damageReduction'
        ).format.replace(/[\+\-]/g, '')
        var attackReductionFormat = vars.shieldStatsDisplayInfo.find(
            displayInfo => displayInfo.name === 'attackReduction'
        ).format

        var battleStats = [
            {
                name: "Health",
                value: `${userData.health.toFixed(1).replace(/\.0+$/, "")} HP`,
                inline: true
            },
            {
                name: "Max Health",
                value: `${userData.maxHealth.toFixed(1).replace(/\.0+$/, "")} HP`,
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
                value: `${userData.exp.toFixed(1).replace(/\.0+$/, "")} XP`,
                inline: true
            },
            {
                name: "Pobucks",
                value: `${userData.bucks} P$`,
                inline: true
            },
            {
                name: "Kills",
                value: String(userData.kills),
                inline: true
            },
            {
                name: "Deaths",
                value: String(userData.deaths),
                inline: true
            },
            {
                name: "Equipped Shield" + ` (${shieldIsUp ? 'Up' : 'Down'})`,
                value: equippedShield ? equippedShield.name : "Error",
                inline: true
            },
            {
                name: "Shields Owned",
                value: String(userData.shieldsOwned.length),
                inline: true
            },
            {
                name: "Damage Reduction",
                value: formatNumberWithPreset(shieldDamageReduction ?? 0, damageReductionFormat),
                inline: true
            },
            {
                name: "Attack",
                value: String(userData.attack) +
                    (shieldAttackReduction && shieldAttackReduction != 0
                        ? ` (${formatNumberWithPreset(shieldAttackReduction, attackReductionFormat)})`
                        : ''),
                inline: true
            },
            {
                name: "Defense",
                value: String(userData.defense),
                inline: true
            },
            {
                name: "Accuracy",
                value: String(userData.accuracy),
                inline: true
            },
            {
                name: "Loot",
                value: String(userData.loot),
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