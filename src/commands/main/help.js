module.exports = {
    name: ['help', 'commands', 'cmds'],
    args: [{
        "name": "command", "required": false, "specifarg": false, "orig": "[command]", "autocomplete": function (interaction) {
            let poopy = this

            var cmds = poopy.commands.map(cmd => {
                return { name: cmd.name.join('/'), value: cmd.name[0] }
            })
            var lcmds = poopy.data.guildData[interaction.guild.id].localcmds.map(lcmd => {
                return { name: lcmd.name, value: lcmd.name }
            })

            return cmds.concat(lcmds)
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let commands = poopy.commands
        let data = poopy.data
        let { similarity, navigateEmbed } = poopy.functions
        let config = poopy.config
        let bot = poopy.bot
        let vars = poopy.vars

        var saidMessage = args.slice(1).join(' ')
        if (saidMessage) {
            var fCmds = commands.filter(cmd =>
                cmd.name.find(name => name.toLowerCase().includes(saidMessage.toLowerCase()))
            ).concat(
                data.guildData[msg.guild.id].localcmds.filter(cmd =>
                    cmd.name.toLowerCase().includes(saidMessage.toLowerCase())
                ).map(lcmd => {
                    return {
                        name: [lcmd.name],
                        help: {
                            name: `${lcmd.name}${lcmd.syntax ? ` ${lcmd.syntax}` : ''}`,
                            value: lcmd.description
                        },
                        type: 'Local'
                    }
                })
            )

            if (fCmds.length) {
                fCmds.sort((a, b) =>
                    Math.abs(1 - similarity(a.name.find(name => name.toLowerCase().includes(saidMessage.toLowerCase())), saidMessage)) -
                    Math.abs(1 - similarity(b.name.find(name => name.toLowerCase().includes(saidMessage.toLowerCase())), saidMessage))
                )

                var findCmds = fCmds.map(cmd => {
                    return {
                        title: cmd.help.name,
                        fields: [
                            {
                                "name": "Description",
                                "value": cmd.help.value || 'No description.'
                            },
                            {
                                "name": "Cooldown",
                                "value": cmd.cooldown ? `${cmd.cooldown / 1000} seconds` : 'None'
                            },
                            {
                                "name": "Type",
                                "value": cmd.type
                            },
                        ]
                    }
                })

                if (!msg.nosend) await navigateEmbed(msg.channel, async (page) => {
                    if (config.textEmbeds) return `\`${fCmds[page - 1].help.name}\`\n\n**Description:** ${fCmds[page - 1].help.value || 'No description.'}\n**Cooldown:** ${fCmds[page - 1].cooldown ? `${fCmds[page - 1].cooldown / 1000} seconds` : 'None'}\n**Type:** ${fCmds[page - 1].type}\n\nCommand ${page}/${findCmds.length}`
                    else return {
                        "title": findCmds[page - 1].title,
                        "color": 0x472604,
                        "footer": {
                            "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            "text": `Command ${page}/${findCmds.length}`
                        },
                        "fields": findCmds[page - 1].fields,
                    }
                }, findCmds.length, msg.member, undefined, undefined, undefined, undefined, undefined, msg)
                return `\`${fCmds[0].help.name}\`\n\n**Description:** ${fCmds[0].help.value || 'No description.'}\n**Cooldown:** ${fCmds[0].cooldown ? `${fCmds[0].cooldown / 1000} seconds` : 'None'}\n**Type:** ${fCmds[0].type}\n\nCommand 1/${findCmds.length}`
            } else {
                if (config.textEmbeds) msg.reply("No commands match your search.").catch(() => { })
                else msg.reply({
                    embeds: [
                        {
                            "description": "No commands match your search.",
                            "color": 0x472604,
                            "footer": {
                                "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                                "text": bot.user.displayName
                            },
                        }
                    ]
                }).catch(() => { })
            }
            return
        }

        var jsonid = config.ownerids.find(id => id == msg.author.id) || config.jsoning.find(id => id == msg.author.id);
        var ownerid = config.ownerids.find(id => id == msg.author.id);

        var categoryOptions = {}

        for (var i in vars.shelpCmds) {
            var shelp = vars.shelpCmds[i]
            if (categoryOptions[shelp.type] == undefined) {
                categoryOptions[shelp.type] = Number(i) + 1
            }
        }

        var categoriesMenu = Object.keys(categoryOptions).map(cat => {
            return {
                label: cat,
                description: vars.categories[cat] || '',
                value: cat
            }
        })

        if (msg.nosend) return `**${vars.shelpCmds[0].type} Commands**\n\n` + "Arguments between \"<>\" are required.\nArguments between \"[]\" are optional.\nArguments between \"{}\" are optional but should normally be supplied.\nMultiple commands can be executed separating them with \"-|-\".\nFile manipulation commands have special options that can be used:\n`-encodingpreset <preset>` - More info in `reencode` command.\n`-filename <name>` - Saves the file as the specified name.\n`-catbox` - Forces the file to be uploaded to catbox.moe.\n`-nosend` - Does not send anything, can be used to execute commands silently.\n`-compress` - Compresses the file before sending it if it's above 8 MB.\n\n" + vars.shelpCmds[0].commands.map(k => `\`${k.name}\`\n> ${k.value}`).join('\n') + `\n\nPage 1/${vars.shelpCmds.length}`

        var helped = false

        var dmChannel = await msg.author.createDM().catch(() => { })

        if (!dmChannel) {
            await msg.reply('Couldn\'t send help to you. Do you have me blocked?').catch(() => { })
            return
        }

        if (bot.user.id == "789189158639501312") {
            var idiot = await bot.users.fetch("464438783866175489").catch(() => { })
            
            var thankEmbed = {
                "title": `Poopy Help`,
                "description": "**hey there umm, thank you so much for using this silly bot!**\n\n" +
                    
                    "it really means a lot to me considering the fact it's a project that exists since late 2020... " +
                    "somehow, even with its VERY outdated code, it still manages to bring joy by making stupid gifs and videos...\n\n" +
                    
                    "...ok enough rambling, here's some links:\n" +
                    `- **website:** <https://poopybot.vercel.app> ([privacy policy](<https://poopybot.vercel.app/privacy>) | [terms of service](<https://poopybot.vercel.app/tos>))\n` +
                    `- **invite:** <https://discord.com/oauth2/authorize?client_id=789189158639501312&scope=bot%20applications.commands&permissions=275415166152>\n` +
                    `- **discord:** <https://discord.com/invite/kGY3BDedFp>\n` +
                    `- **github:** <https://github.com/raleighed/poopy>\n` +
                    `- **donate:** <https://ko-fi.com/raleighed> (i'll make sure to give you something cool if you do)\n\n` +
                    
                    `-# (...will poopy truly live forever this time?)`,
                "color": 0x472604,
                "footer": {
                    "icon_url": (idiot ?? bot.user).displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                    "text": `from this idiot, ${(idiot ?? bot.user).displayName}`
                }
            }

            if (config.textEmbeds) await msg.author.send(`**Poopy Help**\n\n${thankEmbed.description}`).catch(() => { })
            else await msg.author.send({
                embeds: [thankEmbed]
            }).catch(() => { })
        }

        await navigateEmbed(dmChannel, async (page) => {
            var helpEmbedText = `**${vars.shelpCmds[page - 1].type} Commands**\n\n` + "Arguments between \"<>\" are required.\nArguments between \"[]\" are optional.\nArguments between \"{}\" are optional but should normally be supplied.\nMultiple commands can be executed separating them with \"-|-\".\nFile manipulation commands have special options that can be used:\n`-encodingpreset <preset>` - More info in `reencode` command.\n`-filename <name>` - Saves the file as the specified name.\n`-catbox` - Forces the file to be uploaded to catbox.moe.\n`-nosend` - Does not send anything, can be used to execute commands silently.\n`-compress` - Compresses the file before sending it if it's above 8 MB.\n\n" + vars.shelpCmds[page - 1].commands.map(k => `\`${k.name}\`\n> ${k.value}`).join('\n') + `\n\nPage ${page}/${vars.shelpCmds.length}`
            var helpEmbed = {
                "title": `${vars.shelpCmds[page - 1].type} Commands`,
                "description": "Arguments between \"<>\" are required.\nArguments between \"[]\" are optional.\nArguments between \"{}\" are optional but should normally be supplied.\nMultiple commands can be executed separating them with \"-|-\".\nFile manipulation commands have special options that can be used:\n`-encodingpreset <preset>` - More info in `reencode` command.\n`-filename <name>` - Saves the file as the specified name.\n`-catbox` - Forces the file to be uploaded to catbox.moe.\n`-nosend` - Does not send anything, can be used to execute commands silently.\n`-compress` - Compresses the file before sending it if it's above 8 MB.",
                "color": 0x472604,
                "footer": {
                    "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                    "text": `Page ${page}/${vars.shelpCmds.length}`
                },
                "fields": vars.shelpCmds[page - 1].commands,
                "menuText": vars.shelpCmds[page - 1].type
            }

            if (helped) {
                helpEmbedText = `**${vars.shelpCmds[page - 1].type} Commands**\n\n` + vars.shelpCmds[page - 1].commands.map(k => `\`${k.name}\`\n> ${k.value}`).join('\n') + `\n\nPage ${page}/${vars.shelpCmds.length}`
                delete helpEmbed.description
            }

            helped = true

            if (config.textEmbeds) return helpEmbedText.substring(helpEmbedText.length - 2000).replace(new RegExp(vars.validUrl, 'g'), (url) => `<${url}>`)
            else return helpEmbed
        }, vars.shelpCmds.length, msg.author.id, config.useReactions ? [{
            emoji: '🔠',
            reactemoji: '🔠',
            customid: 'category',
            function: async (page) => new Promise(async resolve => {
                var goMessage = await dmChannel.send(`Which category would you like to go... Being case sensitive, we have:\n${Object.keys(categoryOptions).map(c => `- ${c}`).join('\n')}`).catch(() => { })

                var pageCollector = dmChannel.createMessageCollector({ time: 30000 })

                var newpage = page

                pageCollector.on('collect', (m) => {
                    if (!(m.author.id === msg.author.id && ((m.author.id !== bot.user.id && !m.author.bot) || config.allowbotusage))) {
                        return
                    }

                    newpage = categoryOptions[m.content] ?? page
                    pageCollector.stop()
                    m.delete().catch(() => { })
                })

                pageCollector.on('end', () => {
                    if (goMessage) goMessage.delete().catch(() => { })
                    resolve(newpage)
                })
            }),
            page: true
        }] : undefined, undefined, !config.useReactions ? {
            text: 'Select Category',
            customid: 'category',
            options: categoriesMenu,
            function: async (_, option) => categoryOptions[option.values[0]],
            page: true
        } : undefined, true).then(async () => {
            if (jsonid !== undefined) {
                var jsoncmdEmbed = {
                    "title": "JSON Club Commands",
                    "color": 0x472604,
                    "footer": {
                        "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                        "text": bot.user.displayName
                    },
                    "fields": vars.jsonCmds
                };
                if (config.textEmbeds) await msg.author.send(`**JSON Club Commands**\n\n${vars.jsonCmds.map(k => `\`${k.name}\`\n> ${k.value}`).join('\n')}`).catch(() => { })
                else await msg.author.send({
                    embeds: [jsoncmdEmbed]
                }).catch(() => { })
            }
            if (ownerid !== undefined) {
                var devcmdEmbed = {
                    "title": "Owner Commands",
                    "color": 0x472604,
                    "footer": {
                        "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                        "text": bot.user.displayName
                    },
                    "fields": vars.devCmds
                };
                if (config.textEmbeds) await msg.author.send(`**Owner Commands**\n\n${vars.devCmds.map(k => `\`${k.name}\`\n> ${k.value}`).join('\n')}`).catch(() => { })
                else await msg.author.send({
                    embeds: [devcmdEmbed]
                }).catch(() => { })
            }
            await msg.reply('✅ Check your DMs.').catch(() => { })
        }).catch(async (e) => {
            console.log(e)
            await msg.reply('Couldn\'t send help to you. Do you have me blocked?').catch(() => { })
            return
        })

        return `**${vars.shelpCmds[0].type} Commands**\n\n` + "Arguments between \"<>\" are required.\nArguments between \"[]\" are optional.\nArguments between \"{}\" are optional but should normally be supplied.\nMultiple commands can be executed separating them with \"-|-\".\nFile manipulation commands have special options that can be used:\n`-encodingpreset <preset>` - More info in `reencode` command.\n`-filename <name>` - Saves the file as the specified name.\n`-catbox` - Forces the file to be uploaded to catbox.moe.\n`-nosend` - Does not send anything, can be used to execute commands silently.\n`-compress` - Compresses the file before sending it if it's above 8 MB.\n\n" + vars.shelpCmds[0].commands.map(k => `\`${k.name}\`\n> ${k.value}`).join('\n') + `\n\nPage 1/${vars.shelpCmds.length}`
    },
    help: {
        name: 'help/commands/cmds [command]',
        value: 'HELP! You can specify the command parameter if you want help on a certain command.'
    },
    cooldown: 2500,
    type: 'Main'
}
