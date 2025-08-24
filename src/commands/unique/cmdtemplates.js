module.exports = {
    name: ['cmdtemplates', 'commandtemplates'],
    args: [{
        "name": "option",
        "required": true,
        "specifarg": false,
        "orig": "<option>"
    }],
    subcommands: [{
        "name": "list",
        "args": [],
        "description": "Sends a navigable embed with a list of all command templates made by the users of Poopy."
    },
    {
        "name": "search",
        "args": [{
            "name": "query",
            "required": true,
            "specifarg": false,
            "orig": "<query>"
        }],
        "description": "Searches for every command in the command database that matches the query."
    },
    {
        "name": "register",
        "args": [{
            "name": "name",
            "required": true,
            "specifarg": false,
            "orig": "<name>"
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
            "name": "image",
            "required": false,
            "specifarg": true,
            "orig": "[-image <url>]"
        },
        {
            "name": "syntax",
            "required": false,
            "specifarg": true,
            "orig": "[-syntax <text>]"
        }],
        "description": "Registers the command with the respective name, description and syntax (if supplied), it'll then be assigned an ID that can be used to import it via the `localcmds` command."
    },
    {
        "name": "edit",
        "args": [{
            "name": "id",
            "required": true,
            "specifarg": false,
            "orig": "<id>"
        },
        {
            "name": "name",
            "required": false,
            "specifarg": true,
            "orig": "[-name <text>]"
        },
        {
            "name": "phrase",
            "required": false,
            "specifarg": true,
            "orig": "[-phrase <text>]"
        },
        {
            "name": "description",
            "required": false,
            "specifarg": true,
            "orig": "[-description <text>]"
        },
        {
            "name": "image",
            "required": false,
            "specifarg": true,
            "orig": "[-image <url>]"
        },
        {
            "name": "syntax",
            "required": false,
            "specifarg": true,
            "orig": "[-syntax <text>]"
        }],
        "description": "Allows you to edit the command with the respective ID in the database, if it exists and you made it.",
        "autocomplete": function (interaction) {
            let poopy = this
            return poopy.globaldata.commandTemplates.filter(cmd => cmd.creator == interaction.user.id).map(cmd => {
                return { name: `${cmd.name} (${cmd.id})`, value: cmd.id }
            })
        }
    },
    {
        "name": "delete",
        "args": [{
            "name": "id",
            "required": true,
            "specifarg": false,
            "orig": "<id>"
        }],
        "description": "Permanently deletes the command from the database with the respective ID, if it exists and YOU made it.",
        "autocomplete": function (interaction) {
            let poopy = this
            return poopy.globaldata.commandTemplates.filter(cmd => cmd.creator == interaction.user.id).map(cmd => {
                return { name: `${cmd.name} (${cmd.id})`, value: cmd.id }
            })
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let { generateId, navigateEmbed, similarity, fetchPingPerms } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let globaldata = poopy.globaldata
        let vars = poopy.vars
        let config = poopy.config
        let bot = poopy.bot
        let commands = poopy.commands
        let data = poopy.data

        async function createCommand(msg, args) {
            if (!args[1]) {
                await msg.reply('You gotta specify the name!').catch(() => { })
                return
            }

            if (!args[2]) {
                await msg.reply('You gotta specify the phrase!').catch(() => { })
                return
            }

            var name = args[1].toLowerCase()
            var id = generateId(globaldata.commandTemplates.map(c => c.id))
            var creator = msg.author.id
            var date = Math.floor(Date.now() / 1000)

            var params = { name, id, creator, date }

            var imageindex = args.indexOf('-image')
            if (imageindex > -1 && args[imageindex + 1]) {
                if (vars.validUrl.test(args[imageindex + 1])) {
                    params.image = args[imageindex + 1]
                    args.splice(imageindex, 2)
                } else {
                    await msg.reply('Not a valid image URL.').catch(() => { })
                    return
                }
            }

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

            var findCommand = globaldata.commandTemplates.find(cmd => cmd.name === name && cmd.creator === msg.author.id)

            if (findCommand) {
                await msg.reply(`You've already created a command with that name! (ID: \`${findCommand.id}\`)`).catch(() => { })
                return
            } else {
                globaldata.commandTemplates.unshift(params)

                if (!msg.nosend) await msg.reply({
                    content: `✅ \`${name}\` was successfully registered to the command template database! (ID: \`${id}\`)`,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                return `✅ \`${name}\` was successfully registered to the command template database! (ID: \`${id}\`)`
            }
        }

        var options = {
            list: async (msg) => {
                var dcmdTemplates = globaldata.commandTemplates

                if (dcmdTemplates.length <= 0) {
                    if (!msg.nosend) {
                        if (config.textEmbeds) await msg.reply('there is nothing').catch(() => { })
                        else await msg.reply({
                            embeds: [{
                                "title": `there is nothing`,
                                "description": 'wow',
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
                    return 'there is nothing'
                }

                dcmdTemplates.sort((a, b) => {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                })

                var cmdTemplates = []
                for (var i in dcmdTemplates) {
                    var cmd = dcmdTemplates[i]

                    var name = cmd.name
                    var description = cmd.description
                    var syntax = cmd.syntax
                    var image = cmd.image
                    var id = cmd.id
                    var creator = cmd.creator
                    var date = cmd.date

                    var embed = {
                        "title": `${name}${syntax ? ` ${syntax}` : ''}`,
                        "color": 0x472604,
                        "fields": [{
                            name: "Description",
                            value: description || 'No description available.'
                        },
                        {
                            name: "ID",
                            value: `\`${id}\``
                        },
                        {
                            name: "Date Updated",
                            value: `<t:${date}>`
                        }],
                        "footer": {
                            "icon_url": bot.user.displayAvatarURL({
                                dynamic: true, size: 1024, extension: 'png'
                            }),
                            "text": `Made by ${creator} - Command ${Number(i) + 1}/${dcmdTemplates.length}`
                        },
                    }

                    if (image) {
                        embed.image = {
                            url: image
                        }
                    }

                    var textEmbed = `\`${name}${syntax ? ` ${syntax}` : ''}\`\n\n**Description:** ${description || 'No description available.'}\n**ID:** \`${id}\`\n**Date Updated:** <t:${date}>\n\nMade by ${creator} - Command ${Number(i) + 1}/${dcmdTemplates.length}`.substring(0, 2000)

                    cmdTemplates.push({
                        embed: embed,
                        text: textEmbed
                    })
                }

                if (!msg.nosend) await navigateEmbed(msg.channel, async (page) => {
                    if (config.textEmbeds) return cmdTemplates[page - 1].text
                    else return cmdTemplates[page - 1].embed
                },
                    cmdTemplates.length,
                    msg.member,
                    [{
                        emoji: '939523064658526278',
                        reactemoji: '⏬',
                        customid: 'import',
                        style: DiscordTypes.ButtonStyle.Primary,
                        function: async (page, button) => {
                            if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                                var findCommandTemplate = dcmdTemplates[page - 1]

                                if (findCommandTemplate) {
                                    var name = findCommandTemplate.name

                                    var findCommand = commands.find(cmd => cmd.name.find(n => n === name)) || data.guildData[msg.guild.id].localcmds.find(cmd => cmd.name === name)

                                    if (findCommand) {
                                        if (config.useReactions) msg.reply(`The name of that command was already taken!`).catch(() => { })
                                        else button.reply({
                                            content: `The name of that command was already taken!`,
                                            ephemeral: true
                                        }).catch(() => { })
                                        return
                                    }

                                    data.guildData[msg.guild.id].localcmds.push({
                                        name: name,
                                        phrase: findCommandTemplate.phrase,
                                        description: findCommandTemplate.description,
                                        syntax: findCommandTemplate.syntax
                                    })

                                    await msg.reply({
                                        content: `✅ Imported \`${name}\` command from the database.`,
                                        allowedMentions: {
                                            parse: fetchPingPerms(msg)
                                        }
                                    }).catch(() => { })
                                } else {
                                    if (config.useReactions) msg.reply('Error fetching command.').catch(() => { })
                                    else button.reply({
                                        content: 'Error fetching command.',
                                        ephemeral: true
                                    }).catch(() => { })
                                }
                            } else {
                                if (config.useReactions) msg.reply('You need to be a moderator to execute that!').catch(() => { })
                                else button.reply({
                                    content: 'You need to be a moderator to execute that!',
                                    ephemeral: true
                                }).catch(() => { })
                            }
                        },
                        page: false
                    }],
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    msg)
                return cmdTemplates[0].text
            },

            search: async (msg,
                args) => {
                if (!args[1]) {
                    await msg.reply('You gotta specify the name of the command you want to search!').catch(() => { })
                    return
                }

                var saidMessage = args.join('').substring(args[0].length + 1).toLowerCase()

                var ddcmdTemplates = globaldata.commandTemplates
                var none = {
                    "title": `there is nothing`,
                    "description": 'wow',
                    "color": 0x472604,
                    "footer": {
                        "icon_url": bot.user.displayAvatarURL({
                            dynamic: true, size: 1024, extension: 'png'
                        }),
                        "text": bot.user.displayName
                    },
                }

                if (ddcmdTemplates.length <= 0) {
                    if (!msg.nosend) await msg.reply({
                        embeds: [none]
                    }).catch(() => { })
                    return 'there is nothing'
                }

                var dcmdTemplates = []

                ddcmdTemplates.forEach(cmd => {
                    if (cmd.name.includes(saidMessage)) {
                        dcmdTemplates.push(cmd)
                    }
                })

                if (dcmdTemplates.length) {
                    dcmdTemplates.sort((a, b) => Math.abs(1 - similarity(a.name, saidMessage)) - Math.abs(1 - similarity(b.name, saidMessage)))
                } else {
                    if (!msg.nosend) await msg.reply({
                        embeds: [none]
                    }).catch(() => { })
                    return 'there is nothing'
                }

                var cmdTemplates = []
                for (var i in dcmdTemplates) {
                    var cmd = dcmdTemplates[i]

                    var name = cmd.name
                    var description = cmd.description
                    var syntax = cmd.syntax
                    var image = cmd.image
                    var id = cmd.id
                    var creator = cmd.creator
                    var date = cmd.date

                    var embed = {
                        "title": `${name}${syntax ? ` ${syntax}` : ''}`,
                        "color": 0x472604,
                        "fields": [{
                            name: "Description",
                            value: description || 'No description available.'
                        },
                        {
                            name: "ID",
                            value: `\`${id}\``
                        },
                        {
                            name: "Date Updated",
                            value: `<t:${date}>`
                        }],
                        "footer": {
                            "icon_url": bot.user.displayAvatarURL({
                                dynamic: true, size: 1024, extension: 'png'
                            }),
                            "text": `Made by ${creator} - Command ${Number(i) + 1}/${dcmdTemplates.length}`
                        },
                    }

                    if (image) {
                        embed.image = {
                            url: image
                        }
                    }

                    var textEmbed = `\`${name}${syntax ? ` ${syntax}` : ''}\`\n\n**Description:** ${description || 'No description available.'}\n**ID:** \`${id}\`\n**Date Updated:** <t:${date}>\n\nMade by ${creator} - Command ${Number(i) + 1}/${dcmdTemplates.length}`.substring(0, 2000)

                    cmdTemplates.push({
                        embed: embed,
                        text: textEmbed
                    })
                }

                if (!msg.nosend) await navigateEmbed(msg.channel, async (page) => {
                    if (config.textEmbeds) return cmdTemplates[page - 1].text
                    else return cmdTemplates[page - 1].embed
                },
                    cmdTemplates.length,
                    msg.member,
                    [{
                        emoji: '939523064658526278',
                        reactemoji: '⏬',
                        customid: 'import',
                        style: DiscordTypes.ButtonStyle.Primary,
                        function: async (page, button) => {
                            if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                                var findCommandTemplate = dcmdTemplates[page - 1]

                                if (findCommandTemplate) {
                                    var name = findCommandTemplate.name

                                    var findCommand = commands.find(cmd => cmd.name.find(n => n === name)) || data.guildData[msg.guild.id].localcmds.find(cmd => cmd.name === name)

                                    if (findCommand) {
                                        if (config.useReactions) msg.reply(`The name of that command was already taken!`).catch(() => { })
                                        else button.reply({
                                            content: `The name of that command was already taken!`,
                                            ephemeral: true
                                        }).catch(() => { })
                                        return
                                    }

                                    data.guildData[msg.guild.id].localcmds.push({
                                        name: name,
                                        phrase: findCommandTemplate.phrase,
                                        description: findCommandTemplate.description,
                                        syntax: findCommandTemplate.syntax
                                    })

                                    await msg.reply({
                                        content: `✅ Imported \`${name}\` command from the database.`,
                                        allowedMentions: {
                                            parse: fetchPingPerms(msg)
                                        }
                                    }).catch(() => { })
                                } else {
                                    if (config.useReactions) msg.reply('Error fetching command.').catch(() => { })
                                    else button.reply({
                                        content: 'Error fetching command.',
                                        ephemeral: true
                                    }).catch(() => { })
                                }
                            } else {
                                if (config.useReactions) msg.reply('You need to be a moderator to execute that!').catch(() => { })
                                else button.reply({
                                    content: 'You need to be a moderator to execute that!',
                                    ephemeral: true
                                }).catch(() => { })
                            }
                        },
                        page: false
                    }],
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    msg)
                return cmdTemplates[0].text
            },

            register: async (msg,
                args) => {
                return await createCommand(msg,
                    args)
            },

            add: async (msg,
                args) => {
                return await createCommand(msg,
                    args)
            },

            edit: async (msg,
                args) => {
                if (!args[1]) {
                    await msg.reply('You gotta specify the ID!').catch(() => { })
                    return
                }

                var id = args[1].replace(/#/g, '')
                var command = globaldata.commandTemplates.find(cmd => cmd.id === id)
                var commandIndex = globaldata.commandTemplates.findIndex(cmd => cmd.id === id)

                if (command && commandIndex > -1) {
                    if (command.creator !== msg.author.id) {
                        await msg.reply(`idiot you didn't make that command`).catch(() => { })
                        return
                    }

                    var params = {
                        date: Math.floor(Date.now() / 1000)
                    }

                    var nameindex = args.indexOf('-name')
                    if (nameindex > -1 && args[nameindex + 1]) {
                        params.name = args[nameindex + 1].toLowerCase()
                        args.splice(nameindex, 2)
                    }

                    var imageindex = args.indexOf('-image')
                    if (imageindex > -1 && args[imageindex + 1]) {
                        if (vars.validUrl.test(args[imageindex + 1])) {
                            params.image = args[imageindex + 1]
                            args.splice(imageindex, 2)
                        } else {
                            await msg.reply('Not a valid image URL.').catch(() => { })
                            return
                        }
                    }

                    args = args.reverse()

                    for (var i = 0; i < args.length; i++) {
                        var arg = args[i]
                        var argmatch = (arg.match(/^-(description|syntax|phrase)$/) ?? [])[0]
                        if (argmatch) {
                            var val = args.splice(0, i + 1).reverse().slice(1).join(' ')
                            params[argmatch.substring(1)] = val
                            i = -1
                        }
                    }

                    args = args.reverse()

                    if (params.name) {
                        var findCommand = globaldata.commandTemplates.find(cmd => cmd.name === params.name && cmd.creator === msg.author.id)

                        if (findCommand) {
                            await msg.reply(`You've already created a command with that name! (ID: \`${findCommand.id}\`)`).catch(() => { })
                            return
                        }
                    }

                    for (var param in params) {
                        globaldata.commandTemplates[commandIndex][param] = params[param]
                    }

                    if (!msg.nosend) await msg.reply(`✅ Command successfully updated.`).catch(() => { })
                    return `✅ Command successfully updated.`
                } else {
                    await msg.reply('Not a valid ID.').catch(() => { })
                }
            },

            delete: async (msg, args) => {
                if (!args[1]) {
                    await msg.reply('You gotta specify the ID!').catch(() => { })
                    return
                }

                var id = args[1].replace(/#/g, '')
                var command = globaldata.commandTemplates.find(cmd => cmd.id === id)
                var commandIndex = globaldata.commandTemplates.findIndex(cmd => cmd.id === id)

                if (command && commandIndex > -1) {
                    if (command.creator !== msg.author.id) {
                        await msg.reply(`idiot you didn't make that command`).catch(() => { })
                        return
                    }

                    globaldata.commandTemplates.splice(commandIndex, 1)

                    if (!msg.nosend) await msg.reply(`✅ Command successfully deleted.`).catch(() => { })
                    return `✅ Command successfully deleted.`
                } else {
                    await msg.reply('Not a valid ID.').catch(() => { })
                }
            },
        }

        if (!args[1]) {
            var instruction = "**list** - Sends a navigable embed with a list of all command templates made by the users of Poopy.\n\n**search** <query> - Searches for every command in the command database that matches the query.\n\n**register**/**add** <name> <phrase> {-description <text>} [-image <url>] [-syntax <text>] - Registers the command with the respective name, description and syntax (if supplied), it'll then be assigned an ID that can be used to import it via the `localcmds` command.\n\n**edit** <id> [-name <text>] [-phrase <text>] [-description <text>] [-image <url>] [-syntax <text>] - Allows you to edit the command with the respective ID in the database, if it exists and you made it.\n\n**delete** <id> - Permanently deletes the command from the database with the respective ID, if it exists and YOU made it."
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

        await options[args[1].toLowerCase()](msg, args.slice(1))
    },
    help: {
        name: 'cmdtemplates/commandtemplates <option>',
        value: 'Gives you access to a global database of command templates you can use in your servers! Anyone can contribute to it. Use the command alone for more info.'
    },
    cooldown: 5000,
    raw: true,
    type: 'Unique'
}