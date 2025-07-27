module.exports = {
    name: ['poop'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let arrays = poopy.arrays
        let { fetchPingPerms } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })
        var poop = arrays.poopPhrases[Math.floor(Math.random() * arrays.poopPhrases.length)]
            .replace(/{fart}/, Math.floor(Math.random() * 291) + 10)
            .replace(/{seconds}/, Math.floor((Math.random() * 59) + 2))
            .replace(/{mention}/, `<@${msg.author.id}>`)
        if (!msg.nosend) await msg.reply({
            content: poop,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return poop
    },
    help: { name: 'poop', value: 'Poopy says a random funny.' },
    type: 'OG'
}