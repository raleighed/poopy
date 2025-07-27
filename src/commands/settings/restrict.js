module.exports = {
    name: [
        'restrict',
        'restrictchannel'
    ],
    args: [{
        "name": "option",
        "required": true,
        "specifarg": false,
        "orig": "<option>"
    }],
    subcommands: [{
        "name": "list",
        "args": [],
        "description": "Gets a list of restricted channels."
    },
    {
        "name": "toggle",
        "args": [{
            "name": "channel",
            "required": false,
            "specifarg": false,
            "orig": "[channel]",
            "autocomplete": function (interaction) {
                let poopy = this
                let { DiscordTypes } = poopy.modules
                
                return interaction.guild.channels.cache
                    .filter(c => c.type != DiscordTypes.ChannelType.GuildCategory)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(c => ({ name: c.name, value: c.id }))
            }
        }],
        "description": "Restricts/unrestricts bot usage in the channel to moderators only."
    }],
    execute: async function (msg, args) {
        let poopy = this
        let data = poopy.data
        let bot = poopy.bot
        let config = poopy.config
        let { DiscordTypes } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        var options = {
            list: async (msg) => {
                var list = []

                data.guildData[msg.guild.id].restricted.forEach(c => {
                    list.push(`- <#${c}>`)
                })

                if (!list.length) {
                    list = ['None.']
                }

                var listEmbed = {
                    title: `List of restricted channels for ${msg.guild.name}`,
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
                if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || (config.ownerids.find(id => id == msg.author.id))) {
                    var channelId = (args[2] && (args[2].match(/[0-9]+/) ?? [])[0]) || msg.channel.id

                    var findChannel = msg.guild.channels.cache.find(c => c.id === channelId)

                    if (findChannel && findChannel.type != DiscordTypes.ChannelType.GuildCategory) {
                        var findChannelIndex = data.guildData[msg.guild.id].restricted.indexOf(channelId)

                        if (findChannelIndex > -1) {
                            data.guildData[msg.guild.id].restricted.splice(findChannelIndex, 1)

                            if (!msg.nosend) await msg.reply(`Unrestricted <#${findChannel.id}>.`)
                            return `Unrestricted <#${findChannel.id}>.`
                        } else {
                            data.guildData[msg.guild.id].restricted.push(findChannel.id)

                            if (!msg.nosend) await msg.reply(`Restricted <#${findChannel.id}>.`)
                            return `Restricted <#${findChannel.id}>.`
                        }
                    } else {
                        await msg.reply('Not a valid channel.')
                        return
                    }
                } else {
                    await msg.reply('You need to be a moderator to execute that!').catch(() => { })
                    return;
                };
            },
        }

        if (!args[1]) {
            var instruction = "**list** - Gets a list of restricted channels.\n**toggle** [channel] (moderator only) - Restricts/unrestricts bot usage in the channel to moderators only."
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
            await msg.reply('Not a valid option.')
            return
        }

        return await options[args[1].toLowerCase()](msg, args)
    },
    help: {
        name: 'restrict/restrictchannel <option>',
        value: 'Restrict bot usage in channels to moderators only. Use the command alone for more info.'
    },
    cooldown: 5000,
    type: 'Settings'
}