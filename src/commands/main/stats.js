module.exports = {
    name: ['stats', 'botstats'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let bot = poopy.bot
        let { os, fs } = poopy.modules
        let { fetchPingPerms } = poopy.functions
        let config = poopy.config
        let data = poopy.data
        let pkg = poopy.package
        let commands = poopy.commands
        let vars = poopy.vars

        var totalSeconds = (bot.uptime / 1000);
        var days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds % 60);
        var usage = process.memoryUsage()
        var mused = usage.heapUsed / 1024 / 1024
        var rss = usage.rss / 1024 / 1024
        var cusage = process.cpuUsage()
        var cused = (cusage.user + cusage.system) / 1024 / 1024
        var cpu = os.cpus()[0].model
        var servers = bot.guilds.cache.size
        var channels = bot.channels.cache.size
        var emojis = bot.emojis.cache.size
        var files = fs.readdirSync(`temp/${config.database}`).length
        var messages = data.botData.messages
        var users = Object.keys(data.userData).length
        var pcommands = data.botData.commands
        var reboots = data.botData.reboots
        var members = 0

        bot.guilds.cache.forEach(guild => members += guild.memberCount)

        var statsEmbed = {
            title: `${bot.user.displayName}'s Stats`,
            color: 0x472604,
            footer: {
                icon_url: bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                text: `${bot.user.displayName} - v${pkg.version}`
            },
            fields: [
                {
                    name: "Servers",
                    value: servers.toString(),
                    inline: true
                },
                {
                    name: "Channels",
                    value: channels.toString(),
                    inline: true
                },
                {
                    name: "Messages",
                    value: messages.toString(),
                    inline: true
                },
                {
                    name: "Emojis",
                    value: emojis.toString(),
                    inline: true
                },
                {
                    name: "Users",
                    value: users.toString(),
                    inline: true
                },
                {
                    name: "Members",
                    value: members.toString(),
                    inline: true
                },
                {
                    name: "Uptime",
                    value: `${days}d ${hours}h ${minutes}m ${seconds}s`,
                    inline: true
                },
                {
                    name: "Commands",
                    value: commands.length.toString(),
                    inline: true
                },
                {
                    name: "Processed Commands",
                    value: pcommands.toString(),
                    inline: true
                },
                {
                    name: "Commands per Minute",
                    value: vars.cps.toString(),
                    inline: true
                },
                {
                    name: "File Count",
                    value: vars.filecount.toString(),
                    inline: true
                },
                {
                    name: "Processing Files",
                    value: files.toString(),
                    inline: true
                },
                {
                    name: "Reboots",
                    value: reboots.toString(),
                    inline: true
                },
                {
                    name: "CPU",
                    value: cpu.toString(),
                    inline: true
                },
                {
                    name: "Memory Usage",
                    value: `${Math.round(mused * 100) / 100} MB`,
                    inline: true
                },
                {
                    name: "Resident Set Size",
                    value: `${Math.round(rss * 100) / 100} MB`,
                    inline: true
                },
                {
                    name: "CPU Usage",
                    value: `${Math.round(cused * 100) / 100} MB`,
                    inline: true
                },
            ]
        }

        if (!msg.nosend) {
            if (config.textEmbeds) msg.reply({
                content: `${statsEmbed.fields.map(p => `**${p.name}**: ${p.value}`).join('\n')}\n\nv${pkg.version}`,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            else msg.reply({
                embeds: [statsEmbed]
            }).catch(() => { })
        }
        return `${statsEmbed.fields.map(p => `**${p.name}**: ${p.value}`).join('\n')}\n\nv${pkg.version}`
    },
    help: { name: 'stats/botstats', value: "Shows Poopy's stats." },
    cooldown: 2500,
    type: 'Main'
}