module.exports = {
    name: ['rename', 'nickname'],
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
        "orig": "\"<name>\""
    }],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let vars = poopy.vars
        let data = poopy.data
        let { DiscordTypes } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        if (
            !msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ChangeNickname) &&
            !msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageNicknames) &&
            !msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator)
        ) {
            await msg.reply(`I don't have the permission to change your nickname.`).catch(() => { })
            return
        }

        args[1] = args[1] ?? ' '

        var member = await msg.guild.members.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => { }) ?? msg.member

        if (args[1].match(/[0-9]+/)) {
            if (
                !msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageNicknames) &&
                !msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator)
            ) {
                await msg.reply(`I don't have the permission to change the nicknames of other users.`).catch(() => { })
                return
            }

            args.splice(1, 1)
        }

        var name = args.slice(1).join(' ').trim().substring(0, 32)
        if (!name) {
            await msg.reply('Where\'s the name?!').catch(() => { })
            return
        }

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

        var oldName = member.displayName

        var failed = false
        await member.setNickname(name).catch(() => failed = true)

        if (failed) {
            if (!msg.nosend) await msg.reply(`I don’t have permission to change the user’s nickname. Make sure my highest role is above theirs!`).catch(() => { })
            return `I don’t have permission to change the user’s nickname. Make sure my highest role is above theirs!`
        }

        if (!msg.nosend) await msg.reply({
            content: `${oldName.replace(/\@/g, '@‌')}'s nickname was set to **${name}**.`,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return `${oldName.replace(/\@/g, '@‌')}'s nickname was set to **${name}**.`
    },
    help: {
        name: 'rename/nickname [user (manage nicknames permission only)] "<text>" (change nickname permission only)',
        value: 'Allows you to set a nickname on yourself or other users.'
    },
    cooldown: 2500,
    perms: ['Administrator', 'ManageNicknames', 'ChangeNickname'],
    type: 'Main'
}