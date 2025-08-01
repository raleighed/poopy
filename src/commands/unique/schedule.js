module.exports = {
    name: ['schedule', 'timer', 'cron'],
    args: [{
        "name": "option",
        "required": true,
        "specifarg": false,
        "orig": "<option>"
    }],
    subcommands: [{
        "name": "list",
        "args": [],
        "description": "Gets a list of timers set up in the server."
    },
    {
        "name": "info",
        "args": [{
            "name": "timerId",
            "required": true,
            "specifarg": false,
            "orig": "<timerId>",
            "autocompvare": function (interaction) {
                var poopy = this
                return poopy.data.botData.crons.filter(c => c.guildId == interaction.guild.id).map(c => c.id)
            }
        }],
        "description": "Displays the info of the timer that has been set up with the respective ID."
    },
    {
        "name": "add",
        "args": [{
            "name": "channel",
            "required": false,
            "specifarg": false,
            "orig": "[channel]"
        },
        {
            "name": "cron",
            "required": true,
            "specifarg": false,
            "orig": "\"<cron>\""
        },
        {
            "name": "phrase",
            "required": true,
            "specifarg": false,
            "orig": "<phrase>"
        }],
        "description": "Adds a new scheduled timer with the specified phrase and cron syntax."
    },
    {
        "name": "edit",
        "args": [{
            "name": "timerId",
            "required": true,
            "specifarg": false,
            "orig": "<timerId>",
            "autocompvare": function (interaction) {
                var poopy = this
                return poopy.data.botData.crons.filter(c => c.guildId == interaction.guild.id).map(c => c.id)
            }
        },
        {
            "name": "cron",
            "required": false,
            "specifarg": false,
            "orig": "\"[cron]\""
        },
        {
            "name": "phrase",
            "required": false,
            "specifarg": false,
            "orig": "<phrase>"
        }],
        "description": "Edits the scheduled timer with the specified ID."
    },
    {
        "name": "delete",
        "args": [{
            "name": "timerId",
            "required": true,
            "specifarg": false,
            "orig": "<timerId>",
            "autocompvare": function (interaction) {
                var poopy = this
                return poopy.data.botData.crons.filter(c => c.guildId == interaction.guild.id).map(c => c.id)
            }
        }],
        "description": "Deletes the timer from the server."
    }],
    execute: async function (msg, args, opts) {
        var poopy = this
        var data = poopy.data
        var tempdata = poopy.tempdata
        var config = poopy.config
        var vars = poopy.vars
        var bot = poopy.bot
        var { chunkArray, navigateEmbed, generateId, fetchPingPerms, createCronJob } = poopy.functions
        var { DiscordTypes, cron } = poopy.modules

        var options = {
            list: async (msg) => {
                var timersArray = []
                var serverTimers = data.botData.crons.filter(c => c.guildId == msg.guild.id)

                for (var i in serverTimers) {
                    var timer = serverTimers[i]
                    var nextTime = tempdata.crons[timer.id].nextDate()
                    var timestamp = Math.floor(nextTime.ts / 1000)
                    timersArray.push(`- **ID:** ${timer.id} | **Channel:** <#${timer.channelId}> | **Schedule:** \`${timer.cron}\` (Next: <t:${timestamp}:F>)`)
                }

                if (timersArray.length <= 0) {
                    if (!msg.nosend) {
                        if (config.textEmbeds) await msg.reply('No timers set up for this server.').catch(() => { })
                        else await msg.reply({
                            embeds: [{
                                "title": `Scheduled Timers for ${msg.guild.name}`,
                                "description": 'No timers set up for this server.',
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
                    return 'No timers set up for this server.'
                }

                var timers = chunkArray(timersArray, 10)

                if (!msg.nosend) await navigateEmbed(
                    msg.channel, async (page) => {
                        if (config.textEmbeds) return `${timers[page - 1].join('\n')}\n\nPage ${page}/${timers.length}`
                        else return {
                            "title": `Scheduled Timers for ${msg.guild.name}`,
                            "description": timers[page - 1].join('\n'),
                            "color": 0x472604,
                            "footer": {
                                "icon_url": bot.user.displayAvatarURL({
                                    dynamic: true, size: 1024, extension: 'png'
                                }),
                                "text": `Page ${page}/${timers.length}`
                            },
                        }
                    },
                    timers.length,
                    msg.member,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    msg
                )
                return `${timers[0].join('\n')}\n\nPage 1/${timers.length}`
            },

            info: async (msg, args) => {
                if (args[1] == undefined) {
                    await msg.reply('You gotta specify a timer ID!').catch(() => { })
                    return
                }

                var timerId = args[1]
                var timer = data.botData.crons.find(t => t.id === timerId && t.guildId === msg.guild.id)

                var nextTime = tempdata.crons[timerId].nextDate()
                var timestamp = Math.floor(nextTime.ts / 1000)

                if (timer) {
                    if (!msg.nosend) {
                        if (config.textEmbeds) {
                            await msg.reply({
                                content: `**Channel:** <#${timer.channelId}>\n**Schedule:** \`${timer.cron}\` (Next: <t:${timestamp}:F>)\n**Message:**\n${timer.phrase}`,
                                allowedMentions: {
                                    parse: fetchPingPerms(msg)
                                }
                            }).catch(() => { })
                        } else {
                            await msg.reply({
                                embeds: [{
                                    "title": `Timer Info (ID: ${timer.id})`,
                                    "description": `**Channel:** <#${timer.channelId}>\n**Schedule:** \`${timer.cron}\` (Next: <t:${timestamp}:F>)\n**Message:**\n${timer.phrase}`,
                                    "color": 0x472604,
                                    "footer": {
                                        "icon_url": bot.user.displayAvatarURL({
                                            dynamic: true, size: 1024, extension: 'png'
                                        }),
                                        "text": bot.user.displayName
                                    },
                                }],
                                allowedMentions: {
                                    parse: fetchPingPerms(msg)
                                }
                            }).catch(() => { })
                        }
                    }
                    return `Timer Info (ID: ${timer.id})\nChannel: <#${timer.channelId}>\nSchedule: ${timer.cron}\nMessage: ${timer.phrase}`
                } else {
                    await msg.reply(`No timer found with that ID in this server.`).catch(() => { })
                    return
                }
            },

            add: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (!args[1]) {
                        await msg.reply('You gotta specify the cron schedule!').catch(() => { })
                        return
                    }

                    var channel = msg.channel

                    var channelMatch = args[1].match(/^<#(\d+)>$|^(\d+)$/)
                    if (channelMatch) {
                        channel = msg.guild.channels.cache.get(channelMatch[1])
                        if (!channel || channel.type == DiscordTypes.ChannelType.GuildCategory) {
                            await msg.reply('Invalid channel.').catch(() => { })
                            return
                        }

                        args.splice(1, 1)
                    }

                    var saidMessage = args.slice(1).join(' ').replace(/’/g, '\'')
                    vars.symbolreplacements.forEach(symbolReplacement => {
                        symbolReplacement.target.forEach(target => {
                            saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
                        })
                    })
                    var matchedTextes = saidMessage.match(/(?<!\\)"([\s\S]*?)(?<!\\)"/g)
                    if (!matchedTextes) {
                        await msg.reply('You gotta specify the cron schedule!').catch(() => { })
                        return
                    }
                    for (let i = 0; i < matchedTextes.length; i++) {
                        matchedTextes[i] = matchedTextes[i].replace(/\\(?=")/g, "")
                    }

                    var cronTime = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
                    if (!cron.validateCronExpression(cronTime)) {
                        await msg.reply('Invalid cron.').catch(() => { })
                        return
                    }

                    var phrase = saidMessage.replace(matchedTextes[0], "").trim().replace(/`<?@[!&]?[a-z0-9]+>?`/g, (c) => c.slice(1, -1))

                    if (!phrase) {
                        await msg.reply('You gotta specify the message to send!').catch(() => { })
                        return
                    }

                    var timerId = generateId(data.botData.crons.map(c => c.id))

                    var newTimer = {
                        id: timerId,
                        guildId: msg.guild.id,
                        channelId: channel.id,
                        cron: cronTime,
                        phrase
                    }

                    data.botData.crons.push(newTimer)
                    createCronJob(newTimer)

                    var nextTime = tempdata.crons[timerId].nextDate()
                    var timestamp = Math.floor(nextTime.ts / 1000)

                    if (!msg.nosend) await msg.reply({
                        content: `✅ Added new timer with ID \`${timerId}\` that will run \`${cronTime}\` with message \`${phrase.replace(/`/g, "")}\` in <#${channel.id}>.\n-# Next execution: <t:${timestamp}:F>`,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    return `✅ Added new timer with ID \`${timerId}\` that will run \`${cronTime}\` with message \`${phrase.replace(/`/g, "")}\` in <#${channel.id}>.\n-# Next execution: <t:${timestamp}:F>`
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return
                }
            },

            edit: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (args[1] == undefined) {
                        await msg.reply('You gotta specify a timer ID!').catch(() => { })
                        return
                    }

                    var timerId = args[1]
                    var timerIndex = data.botData.crons.findIndex(t => t.id === timerId && t.guildId === msg.guild.id)

                    if (timerIndex === -1) {
                        await msg.reply(`No timer found with that ID in this server.`).catch(() => { })
                        return
                    }

                    var timer = data.botData.crons[timerIndex]
                    var updated = false
                    var updates = []

                    var saidMessage = args.slice(2).join(' ').replace(/’/g, '\'')
                    vars.symbolreplacements.forEach(symbolReplacement => {
                        symbolReplacement.target.forEach(target => {
                            saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
                        })
                    })
                    var matchedTextes = saidMessage.match(/(?<!\\)"([\s\S]*?)(?<!\\)"/g)
                    if (matchedTextes) {
                        for (let i = 0; i < matchedTextes.length; i++) {
                            matchedTextes[i] = matchedTextes[i].replace(/\\(?=")/g, "")
                        }

                        saidMessage = saidMessage.replace(matchedTextes[0], "").trim()

                        var newCron = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
                        if (!cron.validateCronExpression(newCron)) {
                            await msg.reply('Invalid cron.').catch(() => { })
                            return
                        }

                        timer.cron = newCron
                        updated = true
                        updates.push(`schedule to \`${newCron}\``)
                    }

                    if (saidMessage) {
                        timer.phrase = saidMessage.replace(/`<?@[!&]?[a-z0-9]+>?`/g, (c) => c.slice(1, -1))
                        updated = true
                        updates.push(`message to \`${saidMessage.replace(/`/g, "")}\``)
                    }

                    if (!updated) {
                        await msg.reply('No updates specified. Provide either a new cron schedule (in quotes) or a new message.').catch(() => { })
                        return
                    }

                    if (tempdata.crons[timerId]) tempdata.crons[timerId].stop()

                    createCronJob(timer)

                    var nextTime = tempdata.crons[timerId].nextDate()
                    var timestamp = Math.floor(nextTime.ts / 1000)

                    if (!msg.nosend) await msg.reply({
                        content: `✅ Updated timer \`${timerId}\` (${updates.join(' and ')}).\n-# Next execution: <t:${timestamp}:F>`,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    return `✅ Updated timer \`${timerId}\` (${updates.join(' and ')}).\n -# Next execution: <t:${timestamp}:F>`
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return
                }
            },

            delete: async (msg, args) => {
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                    if (args[1] == undefined) {
                        await msg.reply('You gotta specify a timer ID!').catch(() => { })
                        return
                    }

                    var timerId = args[1]
                    var timerIndex = data.botData.crons.findIndex(t => t.id === timerId && t.guildId === msg.guild.id)

                    if (timerIndex > -1) {
                        var removed = data.botData.crons.splice(timerIndex, 1)[0]
                        if (tempdata.crons[timerId]) {
                            tempdata.crons[timerId].stop()
                            delete tempdata.crons[timerId]
                        }

                        if (!msg.nosend) await msg.reply({
                            content: `✅ Removed timer \`${removed.id}\` that was scheduled for \`${removed.cron}\` in <#${removed.channelId}>`,
                            allowedMentions: {
                                parse: fetchPingPerms(msg)
                            }
                        }).catch(() => { })
                        return `✅ Removed timer \`${removed.id}\` that was scheduled for \`${removed.cron}\` in <#${removed.channelId}>`
                    } else {
                        await msg.reply(`No timer found with that ID in this server.`).catch(() => { })
                        return
                    }
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return
                }
            },
        }

        if (!args[1]) {
            var syntaxOverview = "```\n" +
                                "┌────────────── second (optional)\n" +
                                "│ ┌──────────── minute\n" +
                                "│ │ ┌────────── hour\n" +
                                "│ │ │ ┌──────── day of month\n" +
                                "│ │ │ │ ┌────── month\n" +
                                "│ │ │ │ │ ┌──── day of week\n" +
                                "│ │ │ │ │ │\n" +
                                "* * * * * *\n" +
                                "```\n" +
                                "\n" +
                                "**Allowed values per field**\n" +
                                "`second`: `0-59 (optional)`\n" +
                                "`minute`: `0-59`\n" +
                                "`hour`: `0-23`\n" +
                                "`day of month`: `1-31`\n" +
                                "`month`: `1-12 (or names, e.g., Jan, Sep)`\n" +
                                "`day of week`: `0-7 (or names, 0 or 7 are Sunday)`\n" +
                                "\n" +
                                "Learn more at https://nodecron.com/cron-syntax.html"

            var instruction = "**list** - Gets a list of timers set up in the server.\n" +
                            "**info** <timerId> - Displays the info of the timer that has been set up with the respective ID.\n" +
                            "**add** [channel] \"<cron>\" <phrase> (moderator only) - Sets up a new scheduled timer with the specified phrase and cron syntax. Cron syntax overview is listed below.\n" +
                            "**edit** <timerId> \"[cron]\" <phrase> (moderator only) - Edits the scheduled timer with the specified ID, if it exists.\n" +
                            "**delete** <timerId> (moderator only) - Deletes the timer from the server, if it exists."
            if (!msg.nosend) {
                if (config.textEmbeds) msg.reply(instruction + "\n\n" + "**Cron Syntax Overview**\n" + syntaxOverview).catch(() => { })
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
                    },
                    {
                        "title": "Cron Syntax Overview",
                        "description": syntaxOverview,
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
        name: 'schedule/timer/cron <option>',
        value: 'Allows you to set up timers for your server! Use the command alone for more info.'
    },
    cooldown: 2500,
    raw: true,
    type: 'Unique'
}