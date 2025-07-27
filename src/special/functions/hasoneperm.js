module.exports = {
    helpf: '(id | perm1 | perm2 | perm3 | etc...)',
    desc: 'Checks whether the user in the server with the respective ID has one of the specified permissions. (a list of permissions can be found in https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)',
    func: async function (matches, msg) {
        let poopy = this
        let { splitKeyFunc } = poopy.functions
        let { DiscordTypes } = poopy.modules

        var word = matches[1]
        var split = splitKeyFunc(word)
        var id = split[0] ?? ''
        var perms = split.slice(1).length ? split.slice(1) : []

        for (var perm of perms) {
            if (!(DiscordTypes.PermissionFlagsBits[perm])) {
                return `Invalid permission: ${perm}`
            }
        }

        var user = await msg.guild.members.fetch(id).catch(() => { })

        if (user) {
            for (var i in perms) {
                var perm = perms[i]

                if (user.permissions.has(DiscordTypes.PermissionFlagsBits[perm])) {
                    return 'true'
                }
            }
        } else {
            return 'Invalid user ID.'
        }

        return ''
    }
}