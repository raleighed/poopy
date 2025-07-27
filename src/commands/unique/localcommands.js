module.exports = {
    name: ['localcommands',
        'localcmds',
        'servercommands',
        'servercmds'],
    args: [{
        "name": "option",
        "required": true,
        "specifarg": false,
        "orig": "<option>"
    }],
    subcommands: [{
        "name": "list",
        "args": [],
        "description": "Gets a list of local commands."
    },
    {
        "name": "phrase",
        "args": [{
            "name": "command",
            "required": true,
            "specifarg": false,
            "orig": "<command>",
            "autocomplete": function (interaction) {
                let poopy = this
                return poopy.data.guildData[interaction.guild.id].localcmds.map(cmd => cmd.name)
            }
        }],
        "description": "Displays the phrase of a specific command."
    },
    {
        "name": "execute",
        "args": [{
            "name": "command",
            "required": true,
            "specifarg": false,
            "orig": "<command>",
            "autocomplete": function (interaction) {
                let poopy = this
                return poopy.data.guildData[interaction.guild.id].localcmds.map(cmd => cmd.name)
            }
        },
        {
            "name": "args",
            "required": false,
            "specifarg": false,
            "orig": "[args]"
        }],
        "description": "Execute a specific command."
    },
    {
        "name": "add",
        "args": [{
            "name": "command",
            "required": true,
            "specifarg": false,
            "orig": "<command>"
        },
        {
            "name": "phrase",
            "required": true,
            "specifarg": false,
            "orig": "<phrase>"
        },
        {
            "name": "description",
            "required": false,
            "specifarg": true,
            "orig": "{-description <text>}"
        },
        {
            "name": "syntax",
            "required": false,
            "specifarg": true,
            "orig": "[-syntax <text>]"
        }],
        "description": "Adds a new local command, if the name is available for use."
    },
    {
        "name": "import",
        "args": [{
            "name": "id",
            "required": true,
            "specifarg": false,
            "orig": "<id>",
            "autocomplete": function () {
                let poopy = this
                return poopy.globaldata.commandTemplates.map(cmd => {
                    return { name: `${cmd.name} (${cmd.id})`, value: cmd.id }
                })
            }
        },
        {
            "name": "name",
            "required": false,
            "specifarg": false,
            "orig": "[name]"
        }],
        "description": "Imports a new local command from Poopy's command template database (`commandtemplates` command) by ID."
    },
    {
        "name": "edit",
        "args": [{
            "name": "command",
            "required": true,
            "specifarg": false,
            "orig": "<command>",
            "autocomplete": function (interaction) {
                let poopy = this
                return poopy.data.guildData[interaction.guild.id].localcmds.map(cmd => cmd.name)
            }
        },
        {
            "name": "phrase",
            "required": true,
            "specifarg": false,
            "orig": "<phrase>"
        },
        {
            "name": "description",
            "required": false,
            "specifarg": true,
            "orig": "[-description <text>]"
        },
        {
            "name": "syntax",
            "required": false,
            "specifarg": true,
            "orig": "[-syntax <text>]"
        }],
        "description": "Edits the local command, if it exists."
    },
    {
        "name": "delete",
        "args": [{
            "name": "command",
            "required": true,
            "specifarg": false,
            "orig": "<command>",
            "autocomplete": function (interaction) {
                let poopy = this
                return poopy.data.guildData[interaction.guild.id].localcmds.map(cmd => cmd.name)
            }
        }],
        "description": "Deletes the local command, if it exists."
    }],
    execute: async function (msg, args, opts) {
        let poopy = this
        let data = poopy.data
        let config = poopy.config
        let bot = poopy.bot
        let { chunkArray, navigateEmbed, getKeywordsFor, fetchPingPerms } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let globaldata = poopy.globaldata
        let commands = poopy.commands

        var options = {
            list: async (msg) => {
                var localCmdsArray = []
                for (var i in data.guildData[msg.guild.id].localcmds) {
                    var cmd = data.guildData[msg.guild.id].localcmds[i]
                    localCmdsArray.push(`- ${cmd.name}`)
                }

                if (localCmdsArray.length <= 0) {
                    if (!msg.nosend) {
                        if (config.textEmbeds) await msg.reply('None.').catch(() => { })
                        else await msg.reply({
                            embeds: [{
                                "title": `List of local commands for ${msg.guild.name}`,
                                "description": 'None.',
                                "color": 0x472604,
                                "footer": {
                                    "icon_url": bot.user.displayAvatarURL({
                                        dynamic: true, size: 1024, extension: 'png'
                                    }),
                                    "text": bot.user.displayName
                                },
                            }]
                        }).catch(() => { })
                    }
                    return 'None.'
                }

                var localCmds = chunkArray(localCmdsArray, 10)

                if (!msg.nosend) await navigateEmbed(
                    msg.channel, async (page) => {
                        if (config.textEmbeds) return `${localCmds[page - 1].join('\n')}\n\nPage ${page}/${localCmds.length}`
                        else return {
                            "title": `List of local commands for ${msg.guild.name}`,
                            "description": localCmds[page - 1].join('\n'),
                            "color": 0x472604,
                            "footer": {
                                "icon_url": bot.user.displayAvatarURL({
                                    dynamic: true, size: 1024, extension: 'png'
                                }),
                                "text": `Page ${page}/${localCmds.length}`
                            },
                        }
                    },
                    localCmds.length,
                    msg.member,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    msg
                )
                return `${localCmds[0].join('\n')}\n\nPage 1/${localCmds.length}`
            },

            phrase: async (msg, args) => {
                if (args[1] == undefined) {
                    await msg.reply('You gotta specify a command name!').catch(() => { })
                    return
                }

                var findCommand = data.guildData[msg.guild.id].localcmds.findIndex(cmd => cmd.name === args[1].toLowerCase())

                if (findCommand > -1) {
                    if (!msg.nosend) await msg.reply({
                        content: `\`${data.guildData[msg.guild.id].localcmds[findCommand].phrase}\``,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    return data.guildData[msg.guild.id].localcmds[findCommand].phrase
                } else {
                    await msg.reply(`Not a valid command.`).catch(() => { })
                    return
                }
            },

            execute: async (msg, args) => {
                if (args[1] == undefined) {
                    await msg.reply('You gotta specify a command name!').catch(() => { })
                    return
                }

                var findCommand = data.guildData[msg.guild.id].localcmds.findIndex(cmd => cmd.name === args[1].toLowerCase())

                if (findCommand > -1) {
                    var content = msg.content

                    msg.content = `${data.guildData[msg.guild.id].prefix}${args.slice(1).join(' ')}`

                    var localCommand = data.guildData[msg.guild.id].localcmds[findCommand]
                    var oopts = {
                        ...opts
                    }
                    oopts.ownermode = localCommand.ownermode || oopts.ownermode
                    var phrase = await getKeywordsFor(localCommand.phrase, msg, true, opts).catch(() => { }) ?? 'error'
                    if (!msg.nosend) await msg.reply({
                        content: phrase,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })

                    msg.content = content

                    return phrase
                } else {
                    await msg.reply(`Not a valid command.`).catch(() => { })
                    return
                }
            },

            add: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (!args[1]) {
                        await msg.reply('You gotta specify a command name!').catch(() => { })
                        return
                    }
                    if (!args[2]) {
                        await msg.reply('You gotta specify a command phrase!').catch(() => { })
                        return
                    }

                    var name = args[1].toLowerCase()

                    var params = { name }

                    args = args.reverse()

                    for (var i = 0; i < args.length; i++) {
                        var arg = args[i]
                        var argmatch = (arg.match(/^-(description|syntax)$/) ?? [])[0]
                        if (argmatch) {
                            var val = args.splice(0, i + 1).reverse().slice(1).join(' ')
                            params[argmatch.substring(1)] = val
                            i = -1
                        }
                    }

                    args = args.reverse()

                    var saidMessage = args.slice(2).join(' ')

                    if (!saidMessage) {
                        await msg.reply('You gotta specify the phrase!').catch(() => { })
                        return
                    }

                    params.phrase = saidMessage

                    var findCommand = commands.find(cmd => cmd.name.find(n => n === name.toLowerCase())) || data.guildData[msg.guild.id].localcmds.find(cmd => cmd.name === name.toLowerCase())

                    if (findCommand) {
                        await msg.reply(`That name was already taken!`).catch(() => { })
                        return
                    } else {
                        data.guildData[msg.guild.id].localcmds.push(params)

                        if (!msg.nosend) await msg.reply({
                            content: `✅ Added \`${name.toLowerCase()}\` command with phrase \`${saidMessage}\``,
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                        return `✅ Added \`${name.toLowerCase()}\` command with phrase \`${saidMessage}\``
                    }
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return;
                };
            },

            import: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (!args[1]) {
                        await msg.reply('You gotta specify the ID!').catch(() => { })
                        return
                    }

                    var id = args[1].replace(/#/g, '')

                    var findCommandTemplate = globaldata.commandTemplates.find(cmd => cmd.id == id)

                    if (findCommandTemplate) {
                        var name = args[2] ? args[2].toLowerCase() : findCommandTemplate.name

                        var findCommand = commands.find(cmd => cmd.name.find(n => n === name)) || data.guildData[msg.guild.id].localcmds.find(cmd => cmd.name === name)

                        if (findCommand) {
                            await msg.reply(`The name of that command was already taken!`).catch(() => { })
                            return
                        }

                        data.guildData[msg.guild.id].localcmds.push({
                            name: name,
                            phrase: findCommandTemplate.phrase,
                            description: findCommandTemplate.description,
                            syntax: findCommandTemplate.syntax
                        })

                        if (!msg.nosend) await msg.reply({
                            content: `✅ Imported \`${name}\` command from the database.`,
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                        return `✅ Imported \`${name}\` command from the database.`
                    } else {
                        await msg.reply('Not a valid ID.').catch(() => { })
                    }
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return;
                };
            },

            edit: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (args[1] == undefined) {
                        await msg.reply('You gotta specify a command name!').catch(() => { })
                        return
                    }
                    if (!args[2]) {
                        await msg.reply('You gotta specify a command phrase!').catch(() => { })
                        return
                    }

                    var name = args[1].toLowerCase()

                    var params = {}

                    args = args.reverse()

                    for (var i = 0; i < args.length; i++) {
                        var arg = args[i]
                        var argmatch = (arg.match(/^-(description|syntax)$/) ?? [])[0]
                        if (argmatch) {
                            var val = args.splice(0, i + 1).reverse().slice(1).join(' ')
                            params[argmatch.substring(1)] = val
                            i = -1
                        }
                    }

                    args = args.reverse()

                    var saidMessage = args.slice(2).join(' ')

                    if (!saidMessage) {
                        await msg.reply('You gotta specify the phrase!').catch(() => { })
                        return
                    }

                    params.phrase = saidMessage

                    var findCommand = data.guildData[msg.guild.id].localcmds.findIndex(cmd => cmd.name === name.toLowerCase())

                    if (findCommand > -1) {
                        for (var param in params) {
                            data.guildData[msg.guild.id].localcmds[findCommand][param] = params[param]
                        }

                        if (!msg.nosend) await msg.reply({
                            content: `✅ Edited \`${name.toLowerCase()}\` command with phrase \`${saidMessage}\``,
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                        return `✅ Edited \`${name.toLowerCase()}\` command with phrase \`${saidMessage}\``
                    } else {
                        await msg.reply(`Not a valid command.`).catch(() => { })
                        return
                    }
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return;
                };
            },

            delete: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (args[1] == undefined) {
                        await msg.reply('You gotta specify a command name!').catch(() => { })
                        return
                    }

                    var findCommand = data.guildData[msg.guild.id].localcmds.findIndex(cmd => cmd.name === args[1].toLowerCase())

                    if (findCommand > -1) {
                        var removed = data.guildData[msg.guild.id].localcmds.splice(findCommand, 1)

                        if (!msg.nosend) await msg.reply({
                            content: `✅ Removed \`${removed[0].name}\` command with phrase \`${removed[0].phrase}\``,
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                        return `✅ Removed \`${removed[0].name}\` command with phrase \`${removed[0].phrase}\``
                    } else {
                        await msg.reply(`Not a valid command.`).catch(() => { })
                        return
                    }
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return;
                };
            },
        }

        if (!args[1]) {
            var instruction = "**list** - Gets a list of local commands.\n**phrase** <command> - Displays the phrase of a specific command.\n**execute** <command> [args] - Execute a specific command.\n**add** <command> <phrase> {-description <text>} [-syntax <text>] (moderator only) - Adds a new local command, if the name is available for use.\n**import** <id> [name] (moderator only) - Imports a new local command from Poopy's command template database (`commandtemplates` command) by ID.\n**edit** <command> <phrase> [-description <text>] [-syntax <text>] (moderator only) - Edits the local command, if it exists.\n**delete** <command> (moderator only) - Deletes the local command, if it exists."
            if (!msg.nosend) {
                if (config.textEmbeds) msg.reply(instruction).catch(() => { })
                else msg.reply({
                    embeds: [{
                        "title": "Available Options",
                        "description": instruction,
                        "color": 0x472604,
                        "footer": {
                            "icon_url": bot.user.displayAvatarURL({
                                dynamic: true, size: 1024, extension: 'png'
                            }),
                            "text": bot.user.displayName
                        },
                    }]
                }).catch(() => { })
            }
            return instruction
        }

        if (!options[args[1].toLowerCase()]) {
            await msg.reply('Not a valid option.').catch(() => { })
            return
        }

        return await options[args[1].toLowerCase()](msg, args.slice(1))
    },
    help: {
        name: 'localcommands/localcmds/servercommands/servercmds <option>',
        value: 'Allows you to add custom commands to the server! Use the command alone for more info.'
    },
    cooldown: 2500,
    raw: true,
    type: 'Unique'
}