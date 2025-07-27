module.exports = {
    name: ['randomcmd'],
    args: [{ "name": "args", "required": false, "specifarg": false, "orig": "[args]" }, {
        "name": "cmdtype", "required": false, "specifarg": true, "orig": "[-cmdtype <commandType>]",
        "autocomplete": function () {
            let poopy = this
            return poopy.vars.types
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let commands = poopy.commands
        let data = poopy.data
        let { getKeywordsFor, fetchPingPerms } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars
        let tempdata = poopy.tempdata

        var type
        var allCmds = commands.concat(data.guildData[msg.guild.id].localcmds.map(lcmd => {
            return {
                name: [lcmd.name],
                type: 'Local',
                execute: async () => await getKeywordsFor(lcmd.phrase, msg, true, { resetattempts: true, ownermode: lcmd.ownermode }).catch(() => { }) ?? 'error'
            }
        }))

        function chooseCmd() {
            if (type) {
                var foundCmds = []
                for (var i in allCmds) {
                    var cmd = allCmds[i]
                    if (cmd.type === type && !(cmd.type === 'Owner' || cmd.type === 'JSON Club' || cmd.perms || data.guildData[msg.guild.id].disabled.find(c => c.find(n => n === cmd.name.find(nn => nn === n))))) {
                        foundCmds.push(cmd)
                    }
                }

                if (foundCmds.length) {
                    return foundCmds[Math.floor(Math.random() * foundCmds.length)]
                }

                return allCmds[Math.floor(Math.random() * allCmds.length)]
            } else {
                var cmd = allCmds[Math.floor(Math.random() * allCmds.length)]
                if (cmd.type === 'Owner' || cmd.type === 'JSON Club' || cmd.perms || data.guildData[msg.guild.id].disabled.find(c => c.find(n => n === cmd.name.find(nn => nn === n)))) {
                    return chooseCmd()
                }
                return cmd
            }
        }

        var typeindex = args.indexOf('-cmdtype')
        if (typeindex > -1) {
            if (vars.types.find(type => type.toLowerCase() === args.slice(typeindex + 1).join(' ').toLowerCase())) {
                type = vars.types.find(type => type.toLowerCase() === args.slice(typeindex + 1).join(' ').toLowerCase())
                args.splice(typeindex)
            }
        }

        var cmd = chooseCmd()

        if (!cmd) {
            await msg.reply('there is no dog').catch(() => { })
            return
        }

        var cmdmessage = !msg.nosend && await msg.reply({
            content: `Executing \`${cmd.name[0]}\`.`,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        if (cmd.cooldown) {
            data.guildData[msg.guild.id].members[msg.author.id].coolDown = (data.guildData[msg.guild.id].members[msg.author.id].coolDown || Date.now()) + cmd.cooldown / ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID) && (cmd.type === 'Text' || cmd.type === 'Main') ? 5 : 1)
        }

        var deletetimeout = setTimeout(() => {
            if (!cmdmessage) return
            cmdmessage.delete().catch(() => { })
            clearTimeout(deletetimeout)
        }, 3000)

        var phrase = await cmd.execute.call(poopy, msg, args).catch(() => { }) ?? 'error'
        if (tempdata[msg.guild.id][msg.channel.id].shut) return
        if (cmd.type == 'Local' && !msg.nosend) {
            await msg.reply({
                content: phrase,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
        }
        return phrase
    },
    help: {
        name: 'randomcmd [args] [-cmdtype <commandType>]',
        value: 'Executes a completely random Poopy command.\n' +
            'Example usage: p:randomcmd -cmdtype Local'
    },
    cooldown: 2500,
    type: 'Random'
}