module.exports = {
    name: ['block'],
    args: [{
        "name": "subject", "required": true, "specifarg": false, "orig": "<subject>",
        "autocomplete": async function (interaction) {
            let poopy = this
            let { data, config } = poopy
            let { dataGather } = poopy.functions

            if (!data.guildData[interaction.guild.id]) {
                data.guildData[interaction.guild.id] = !config.testing && process.env.MONGOOSE_URL && await dataGather.guildData(config.database, interaction.guild.id).catch((e) => console.log(e)) || {}
            }

            var memberData = data.guildData[interaction.guild.id].allMembers ?? {} ?? {}
            var memberKeys = Object.keys(memberData).sort((a, b) => memberData[b].messages - memberData[a].messages)

            return memberKeys.map(id => {
                return { name: memberData[id].username, value: id }
            })
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let data = poopy.data
        let bot = poopy.bot
        let config = poopy.config
        let { fetchPingPerms } = poopy.functions

        var options = {
            list: async (msg) => {
                var list = []

                data.userData[msg.author.id].blocked.forEach(u => {
                    list.push(`- ${u.name} (${u.id})`)
                })

                if (!list.length) {
                    list = ['None.']
                }

                var listEmbed = {
                    title: `List of users blocked from attacking`,
                    description: list.join('\n'),
                    color: 0x472604,
                    footer: {
                        icon_url: bot.user.displayAvatarURL({
                            dynamic: true, size: 1024, extension: 'png'
                        }),
                        text: bot.user.displayName
                    }
                }

                if (!msg.nosend) {
                    if (config.textEmbeds) msg.reply({
                        content: list.join('\n'),
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    else msg.reply({
                        embeds: [listEmbed]
                    }).catch(() => { })
                }
                return list.join('\n')
            },

            toggle: async (msg, args) => {
                var userId = args[2] && (args[2].match(/[0-9]+/) ?? [])[0]

                if (!userId) {
                    await msg.reply('You need to specify a user!').catch(() => { })
                    return
                }

                var findUser = bot.users.fetch(userId)
                if (findUser?.catch) findUser = await findUser.catch(() => { })

                if (findUser) {
                    var findUserIndex = data.userData[msg.author.id].blocked.findIndex(u => u.id == userId)

                    if (findUserIndex > -1) {
                        data.userData[msg.author.id].blocked.splice(findUserIndex, 1)

                        if (!msg.nosend) await msg.reply(`User **${findUser.displayName.replace(/\@/g, '@‌')}** has been **unblocked**, now you can attack each other.`)
                        return `User **${findUser.displayName.replace(/\@/g, '@‌')}** has been **unblocked**, now you can attack each other.`
                    } else {
                        data.userData[msg.author.id].blocked.push({
                            id: findUser.id,
                            name: findUser.displayName
                        })

                        if (!msg.nosend) await msg.reply(`User **${findUser.displayName.replace(/\@/g, '@‌')}** has been **blocked**, now neither of you can attack each other.`)
                        return `User **${findUser.displayName.replace(/\@/g, '@‌')}** has been **blocked**, now neither of you can attack each other.`
                    }
                } else {
                    await msg.reply('Not a valid user.').catch(() => { })
                    return
                }
            },
        }

        if (!args[1]) {
            var instruction = "**list** - Gets a list of blocked users.\n**toggle** <subject> - Blocks/unblocks an user from attacking you."
            if (!msg.nosend) {
                if (config.textEmbeds) msg.reply({
                    content: instruction,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
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
            args.push(1, 0, "")
            await options.toggle(msg, args)
            return
        }

        return await options[args[1].toLowerCase()](msg, args)
    },
    help: { name: 'block <subject>', value: 'Block someone from attacking you!' },
    type: 'Battling'
}