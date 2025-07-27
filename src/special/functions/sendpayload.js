module.exports = {
    helpf: '(json) (manage messages only)',
    desc: 'Requiring a TON on knowledge of Discord.JS, allows you to send complex messages with JSON to the channel, including embeds, attachments, and even buttons! Returns the message\'s ID afterwards.',
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let tempdata = poopy.tempdata
        let { DiscordTypes } = poopy.modules
        let { tryJSONparse, getKeywordsFor } = poopy.functions
        let globaldata = poopy.globaldata
        let tempfiles = poopy.tempfiles
        let data = poopy.data
        let vars = poopy.vars
        let config = poopy.config

        var jopts = { ...opts }
        jopts.declaredonly = true

        var word = await getKeywordsFor(matches[1], msg, isBot, jopts).catch((e) => console.log(e)) ?? matches[1]

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

        if (!opts.ownermode && tempdata[msg.author.id][msg.id].execCount >= 1 && data.guildData[msg.guild.id].chaincommands == false && !(msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot)) return 'You can\'t chain commands in this server.'
        if (!opts.ownermode && tempdata[msg.author.id][msg.id].execCount >= config.commandLimit * ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot) ? 5 : 1)) return `Number of commands to run at the same time must be smaller or equal to **${config.commandLimit * ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || isBot) ? 5 : 1)}**!`
        tempdata[msg.author.id][msg.id].execCount++

        data.guildData[msg.guild.id].members[msg.author.id].coolDown = (data.guildData[msg.guild.id].members[msg.author.id].coolDown || Date.now()) + 2500 / ((msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID) ? 5 : 1)

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id) || isBot) {
            var payload = tryJSONparse(word)
            if (!payload) return 'Malformatted payload JSON.'

            payload.allowedMentions = {
                parse: fetchPingPerms(msg)
            }

            if (payload.files) payload.files.filter(file => {
                return file.attachment.match(vars.validUrl) || file.attachment.match(/temp:[a-zA-Z0-9_-]{10}/g)
            }).map(file => {
                if (!file.attachment.match(/^temp:[a-zA-Z0-9_-]{10}$/)) return file

                var id = file.attachment.substring(5)
                var tempfile = tempfiles[id]

                if (!tempfile) return file

                file.attachment = `tempfiles/${config.mongodatabase}/${tempfile.name}`

                return file
            })

            var err
            var m = await msg.channel.send(payload).catch((e) => err = e.message)
            if (err) return err

            return m.id
        } else {
            return 'You need to have the manage messages permission to execute that!'
        }
    },
    attemptvalue: 20,
    raw: true
}