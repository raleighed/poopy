module.exports = {
    name: ['dm'],
    args: [{
        "name": "user",
        "required": true,
        "specifarg": false,
        "orig": "<user>",
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
    },
    {
        "name": "message",
        "required": true,
        "specifarg": false,
        "orig": "<message>"
    },
    {
        "name": "anonymous",
        "required": false,
        "specifarg": true,
        "orig": "[-anonymous]"
    }],
    execute: async function (msg, args, opts) {
        let poopy = this
        let { shuffle, randomChoice, yesno, dataGather, fetchPingPerms } = poopy.functions
        let { Discord, DiscordTypes } = poopy.modules
        let json = poopy.json
        let data = poopy.data
        let bot = poopy.bot
        let config = poopy.config
        let tempdata = poopy.tempdata

        await msg.channel.sendTyping().catch(() => { })
        if (args[1] === undefined) {
            await msg.reply('Who do I DM?!').catch(() => { })
            return;
        };
        var anon = false
        var anonIndex = args.indexOf('-anonymous')
        if (anonIndex > -1) {
            args.splice(anonIndex, 1)
            //anon = true
        }
        var saidMessage = args.slice(2).join(' ')
        var attachments = []
        msg.attachments.forEach(attachment => {
            attachments.push(new Discord.AttachmentBuilder(attachment.url))
        });
        if (args[2] === undefined && attachments.length <= 0) {
            await msg.reply('What is the message to DM?!').catch(() => { })
            return;
        };

        var ownerid = (config.ownerids.find(id => id == msg.author.id));
        if (args[1].match(/^@(here|everyone)$/) && (Math.random() < 0.2 || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) || msg.author.id == msg.guild.ownerID || ownerid || opts.ownermode)) {
            var len = config.useReactions ? 20 : 25
            var ha = shuffle(
                msg.guild.emojis.cache.filter(emoji => 
                    !(config.self && config.useReactions) ? emoji.available : emoji.available && !emoji.animated
                ).map(e => e.toString())
            ).slice(0, len)
            var he = shuffle(json.emojiJSON.map(e => e.emoji)).slice(0, len - ha.length)
            var hi = shuffle(ha.concat(he)).map(emoji => {
                return {
                    emoji: emoji,
                    reactemoji: emoji,
                    customid: emoji,
                    style: randomChoice([
                        DiscordTypes.ButtonStyle.Primary,
                        DiscordTypes.ButtonStyle.Secondary,
                        DiscordTypes.ButtonStyle.Success,
                        DiscordTypes.ButtonStyle.Danger
                    ]),
                    resolve: false
                }
            })
            var ho = randomChoice(hi)
            ho.resolve = true

            var hu = await yesno(msg.channel, `It's time to choose the wise one`, msg.member, hi, msg).catch((e) => console.log(e))

            if (hu) {
                data.userData[msg.author.id].bucks += 5000
                await msg.reply(`***YES!!🥳🥳🥳🥳🎉🎉*** *YES !!!!!* **THAT'S THE** __*Only Thing You Need From The Doctor*__, the ${ho.emoji}.🎉🎉🎉🎉🎉🎉 ***AND*** *NOW* YOUHAVE, __*100% Fresh Juiced from Florida*__, __***\`+5000 POBUCKS\`***__ *FOREVER*👍`).catch(() => { })
            } else {
                await msg.reply('invalid').catch(() => { })
            }
            return
        }

        args[1] = args[1] ?? ''

        var member = await bot.users.fetch((args[1].match(/[0-9]+/) ?? [args[1]])[0]).catch(() => { })

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
        if (!tempdata[member.id]) {
            tempdata[member.id] = {}
        }

        if (data.userData[member.id].dms === undefined && !tempdata[member.id].dmconsent && member.id != msg.author.id) {
            tempdata[msg.author.id].dmconsent = true

            var pending = await msg.reply('This user hasn’t received bot DMs from this command before... A consent request has been sent and is awaiting their approval!').catch(() => { })
            var send = await yesno(member, `${!anon ? msg.author.tag : 'Someone'} is trying to send you a DM using the bot. Will you consent to receiving any unrelated messages from the \`dm\` command?`, member.id).catch(() => { })

            if (send !== undefined) {
                data.userData[member.id].dms = send
                member.send({
                    content: `Unrelated DMs from \`dm\` will **${!send ? 'not ' : ''}be sent** to you now. To change this setting, use the \`toggledms\` command.`,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                if (pending) {
                    pending.edit(send ? 'You can send DMs to the user now.' : 'blocked on twitter').catch(() => { })
                }
            } else {
                pending.edit('Couldn\'t send a message to this user. Make sure they share any of the servers I\'m in, or not have me blocked.').catch(() => { })
            }
        } else {
            if (data.userData[member.id].dms === false && member.id != msg.author.id && !data.guildData[msg.guild.id].chaos) {
                await msg.reply('I don\'t have the permission to send unrelated DMs to this user.').catch(() => { })
                return
            }

            var infoMessage = !anon ? `${msg.author.tag} from ${msg.guild.name}:\n\n` : ''

            var dmChannel = await member.createDM().catch(() => { })
            if (!dmChannel) return

            dmChannel.nsfw = !!data.guildData[dmChannel.id]?.channels?.[dmChannel.id]?.nsfw

            if (!dmChannel.nsfw) saidMessage = saidMessage.replace(/https?:\/\/(rule34|e621)([!#$&-;=?-[\]_a-z~]|%[0-9a-fA-F])*/g, 'no')

            var dmMessage = await dmChannel.send({
                content: `${infoMessage}${saidMessage}`,
                files: attachments
            }).catch(() => { })

            if (dmMessage) {
                if (!msg.nosend) {
                    if (msg.type === DiscordTypes.InteractionType.ApplicationCommand && !msg.replied) await msg.reply({ content: 'Successfully sent.', ephemeral: true }).catch(() => { })
                    else msg.react('✅').catch(() => { })
                }
                return `${infoMessage}${saidMessage}`
            } else {
                await msg.reply(member.id == msg.author.id ? 'unblock me' : 'Couldn\'t send a message to this user. Make sure they share any of the servers I\'m in, or not have me blocked.').catch(() => { })
            }
        }
    },
    help: {
        name: 'dm <user> <message> [-anonymous]',
        value: 'Allows Poopy to DM an user the message inside the command.'
    },
    nodefer: true,
    type: 'Main'
}
