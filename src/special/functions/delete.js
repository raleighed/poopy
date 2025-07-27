module.exports = {
    helpf: '(id) (manage messages only)',
    desc: 'Deletes the message.',
    func: async function (matches, msg, isBot) {
        let poopy = this
        let config = poopy.config
        let { DiscordTypes } = poopy.modules

        var word = matches[1]
        var id = word || msg.id

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.roles.cache.find(role => role.name.match(/mod|dev|admin|owner|creator|founder|staff/ig)) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id) || isBot) {
            var messageToDelete = word ? msg.channel.messages.fetch(id) : msg
            if (messageToDelete.catch) messageToDelete = await messageToDelete.catch(() => { })

            if (messageToDelete) {
                await messageToDelete.delete().catch(() => { })
            }
        } else {
            return 'You need to have the manage messages permission to execute that!'
        }

        return ''
    }
}