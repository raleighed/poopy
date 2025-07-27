module.exports = {
    name: ['tango', 'deleteembed', 'dembed'],
    args: [{"name":"message","required":false,"specifarg":false,"orig":"{message}"}],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let { fetchPingPerms } = poopy.functions
        
        if (config.textEmbeds) {
            await msg.reply('but how').catch(() => { })
            return
        }

        var saidMessage = args.slice(1).join(' ')
        var rulesChannel = msg.guild.channels.cache.find(channel => channel.name === 'rules' || channel.name.includes('rule') || true)
        var tangoEmbed = {
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' })
            },
            "description": `**Message sent by <@${msg.author.id}> deleted in <#${rulesChannel && rulesChannel.id || msg.channel.id}>**\n${saidMessage}`,
            "color": 0xFF470F,
            "timestamp": new Date().toISOString(),
            "footer": {
                "text": `Author: ${msg.author.id} | Message ID: ${msg.id}`
            },
        };
        if (!msg.nosend) await msg.reply({
            allowedMentions: {
                parse: fetchPingPerms(msg)
            },
            embeds: [tangoEmbed]
        }).catch((e) => console.log(e))
        return 'but how'
    },
    help: { name: 'tango/deleteembed/dembed {message}', value: 'tango' },
    cooldown: 2500,
    type: 'Inside Joke'
}
