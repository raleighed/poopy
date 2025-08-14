module.exports = {
    name: ['impostor',
        'imposter',
        'sus'],
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
    }],
    execute: async function (msg, args) {
        let poopy = this
        let data = poopy.data
        let config = poopy.config
        let { dataGather, fetchPingPerms } = poopy.functions
        let { DiscordTypes } = poopy.modules

        args[1] = args[1] ?? ' '

        var member = await msg.guild.members.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => {}) ?? msg.member

        if (!member) {
            await msg.reply({
                content: `Invalid user ID: **${args[1]}**`,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            return
        }

        if (!data.guildData[msg.guild.id].members[member.id]) {
            data.guildData[msg.guild.id].members[member.id] = !config.testing && process.env.MONGOOSE_URL && await dataGather.memberData(config.database, msg.guild.id, msg.author.id).catch(() => { }) || {}
        }

        if (!data.guildData[msg.guild.id].members[member.id].impostor) {
            data.guildData[msg.guild.id].members[member.id].impostor = false
        }

        if (data.guildData[msg.guild.id].members[member.id].impostor === false) {
            if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageWebhooks) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                data.guildData[msg.guild.id].members[member.id].impostor = true
                if (!msg.nosend) await msg.reply({
                    content: member.displayName.replace(/\@/g, '@‌') + ' is now the Impostor.',
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => {})
                return member.displayName.replace(/\@/g, '@‌') + ' is now the Impostor.'
            } else {
                await msg.reply('You need to have the manage webhooks/messages permission to execute that!').catch(() => {})
                return;
            };
        } else {
            data.guildData[msg.guild.id].members[member.id].impostor = false
            if (!msg.nosend) await msg.reply({
                content: member.displayName.replace(/\@/g, '@‌') + ' is not the Impostor.',
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            return member.displayName.replace(/\@/g, '@‌') + ' is not the Impostor.'
        }
    },
    help: {
        name: 'impostor/imposter/sus [user] (manage webhooks/messages permission only)',
        value: 'Trap someone in the impostor forcefully'
    },
    cooldown: 2500,
    perms: ['Administrator',
        'ManageMessages'],
    type: 'Webhook'
}