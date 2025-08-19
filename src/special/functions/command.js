module.exports = {
    helpf: '(name | arguments)',
    desc: 'Allows you to execute any command!',
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let { splitKeyFunc, getUrls, infoPost, getKeywordsFor, getOption } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let globaldata = poopy.globaldata
        let commands = poopy.commands
        let data = poopy.data
        let tempdata = poopy.tempdata
        let config = poopy.config
        let vars = poopy.vars

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 2 })
        var commandname = (await getKeywordsFor(split[0] ?? '', msg, isBot, opts).catch(() => { }) ?? split[0]).toLowerCase()
        var args = split[1] ?? ''
        var command = commands.find(fcmd => fcmd.name.find(fcmdname => fcmdname === commandname))
        var localCommand = data.guildData[msg.guild.id].localcmds.find(cmd => cmd.name === commandname)
        var error = ''

        if (tempdata[msg.guild.id][msg.channel.id].shut) return ''

        if (globaldata.shit.find(id => id === msg.author.id)) return 'shit'

        if (data.guildData[msg.guild.id].members[msg.author.id].coolDown) {
            if ((data.guildData[msg.guild.id].members[msg.author.id].coolDown - Date.now()) > 0 &&
                tempdata[msg.author.id].cooler !== msg.id) {
                return `Calm down! Wait more ${(data.guildData[msg.guild.id].members[msg.author.id].coolDown - Date.now()) / 1000} seconds.`
            } else {
                data.guildData[msg.guild.id].members[msg.author.id].coolDown = false
            }
        }

        tempdata[msg.author.id].cooler = msg.id

        if (command || localCommand) {
            var isDisabled = data.guildData[msg.guild.id].disabled.find(cmd => cmd.find(n => n === commandname)) && !(
                msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) ||
                msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) ||
                msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) ||
                msg.author.id === msg.guild.ownerID ||
                (config.ownerids.find(id => id == msg.author.id)) ||
                isBot
            )

            if (isDisabled) {
                return 'This command is disabled in this server.'
            } else {
                var content = msg.content

                var ropts = { ...opts }
                ropts.declaredonly = (command || localCommand).raw
                args = await getKeywordsFor(args, msg, isBot, ropts).catch(() => { }) ?? args
                args = (`${commandname}${args ? ` ${args}` : ''}`).split(' ')
                delete msg.nosend
                msg.nosend = getOption(args, 'nosend', { n: 0, splice: true, dft: false })
                msg.content = `${data.guildData[msg.guild.id].prefix}${args.join(' ')}`

                await getUrls(msg, {
                    string: msg.content,
                    update: true
                }).catch(() => { })

                if (command) {
                    var increaseCount = !(command.execute.toString().includes('sendFile') && msg.nosend)

                    if (increaseCount) {
                        if (!opts.ownermode && tempdata[msg.author.id][msg.id].execCount >= 1 && data.guildData[msg.guild.id].chaincommands == false && !(msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot)) {
                            msg.content = content
                            return 'You can\'t chain commands in this server.'
                        }
                        if (!opts.ownermode && tempdata[msg.author.id][msg.id].execCount >= config.commandLimit * ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot) ? 5 : 1)) {
                            msg.content = content
                            return `Number of commands to run at the same time must be smaller or equal to **${config.commandLimit * ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot) ? 5 : 1)}**!`
                        }
                        tempdata[msg.author.id][msg.id].execCount++
                    }

                    if (command.cooldown) {
                        data.guildData[msg.guild.id].members[msg.author.id].coolDown = (data.guildData[msg.guild.id].members[msg.author.id].coolDown || Date.now()) + command.cooldown / ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID) && (command.type === 'Text' || command.type === 'Main') ? 5 : 1)
                    }

                    vars.cps++
                    data.botData.commands++
                    var t = setTimeout(() => {
                        vars.cps--;
                        clearTimeout(t)
                    }, 1000)

                    infoPost(`Command \`${commandname}\` used`)
                    await command.execute.call(poopy, msg, args, { ownermode: opts.ownermode }).catch(err => {
                        error = err.stack
                    })
                    data.botData.filecount = vars.filecount
                    msg.content = content
                } else if (localCommand) {
                    vars.cps++
                    data.botData.commands++
                    var t = setTimeout(() => {
                        vars.cps--;
                        clearTimeout(t)
                    }, 60000)
                    infoPost(`Command \`${commandname}\` used`)
                    var oopts = { ...opts }
                    oopts.ownermode = localCommand.ownermode || oopts.ownermode
                    var phrase = await getKeywordsFor(localCommand.phrase, msg, true, oopts).catch(() => { }) ?? 'error'
                    data.botData.filecount = vars.filecount
                    msg.content = content
                    return phrase
                }
            }
        } else {
            return 'Invalid command.'
        }

        return error
    },
    attemptvalue: 10,
    raw: true
}
