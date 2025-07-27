module.exports = {
    helpf: '(id | phrase) (manage messages only)',
    desc: 'Edits a message sent by Poopy.',
    func: async function (matches, msg, isBot) {
        let poopy = this
        let { splitKeyFunc, fetchPingPerms } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let config = poopy.config
        let bot = poopy.bot

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 2 })
        var id = split[0] ?? ''
        var phrase = split[1] ?? ''

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.roles.cache.find(role => role.name.match(/mod|dev|admin|owner|creator|founder|staff/ig)) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id) || isBot) {
            var messageToEdit = msg.channel.messages.fetch(id)
            if (messageToEdit.catch) messageToEdit = await messageToEdit.catch(() => { })

            if (messageToEdit) {
                if (messageToEdit.author.id !== bot.user.id) {
                    return ''
                }

                await messageToEdit.edit({
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    },
                    content: phrase
                }).catch(() => { })
            }
        } else {
            return 'You need to have the manage messages permission to execute that!'
        }

        return ''
    }
}