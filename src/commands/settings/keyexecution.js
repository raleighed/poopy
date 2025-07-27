module.exports = {
    name: ['keyexecution', 'keyexec'],
    args: [{ "name": "mode", "required": true, "specifarg": false, "orig": "<mode (Message, Command or None)>", "autocomplete": ["Message", "Command", "None"] }],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let data = poopy.data
    let { DiscordTypes } = poopy.modules

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
            if (args[1] === undefined) {
                await msg.reply('You must specify the mode!').catch(() => { })
                return
            }

            var modes = {
                message: {
                    value: 2,
                    desc: `Key execution will perform every message.`
                },
                command: {
                    value: 1,
                    desc: `Key execution will perform every command usage.`
                },
                none: {
                    value: 0,
                    desc: `Key execution will only perform internally.`
                }
            }
            var mode = modes[args[1].toLowerCase()]

            if (!mode) {
                await msg.reply('Not a valid mode.').catch(() => { })
                return
            }

            data.guildData[msg.guild.id].keyexec = mode.value
            if (!msg.nosend) await msg.reply(`Key execution mode set to \`${args[1].toCapperCase()}\`. ${mode.desc}`).catch(() => { })
            return `Key execution mode set to \`${args[1].toCapperCase()}\`. ${mode.desc}`
        } else {
            await msg.reply('You need to be a moderator to execute that!').catch(() => { })
            return;
        };
    },
    help: {
        name: 'keyexecution/keyexec <mode (Message, Command or None)> (moderator only)',
        value: "Set Poopy's mode of executing keywords, by message, command, or none."
    },
    cooldown: 5000,
    perms: ['Administrator', 'ManageMessages'],
    type: 'Settings'
}