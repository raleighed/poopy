module.exports = {
    name: ['img', 'image'],
    args: [{"name":"query","required":true,"specifarg":false,"orig":"<query>"},{"name":"page","required":false,"specifarg":true,"orig":"[-page <number>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let { fetchImages, navigateEmbed, addLastUrl } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let config = poopy.config

        await msg.channel.sendTyping().catch(() => { })
        if (args[1] === undefined) {
            await msg.reply('What do I search for?!').catch(() => { })
            return;
        }

        var page = 1
        var pageindex = args.indexOf('-page')
        if (pageindex > -1) {
            page = isNaN(Number(args[pageindex + 1])) ? 1 : Number(args[pageindex + 1]) <= 1 ? 1 : Math.round(Number(args[pageindex + 1])) || 1
            args.splice(pageindex, 2)
        }

        var search = args.slice(1).join(" ");

        var urls = await fetchImages(search, msg.channel.nsfw).catch(() => { })

        if (!urls) {
            await msg.reply('Error.').catch(() => { })
            return;
        }

        if (!urls.length) {
            await msg.reply('Not found.').catch(() => { })
            return;
        }

        var number = page
        if (number > urls.length) number = urls.length;
        if (number < 1) number = 1

        if (!msg.nosend) await navigateEmbed(msg.channel, async (page) => {
            addLastUrl(msg, urls[page - 1])

            if (config.textEmbeds) return `${urls[page - 1]}\n\nImage ${page}/${urls.length}`
            else return {
                "title": "Google Image Search Results For " + search,
                "description": "Use the arrows to navigate.",
                "color": 0x472604,
                "footer": {
                    "text": "Image " + page + "/" + urls.length
                },
                "image": {
                    "url": urls[page - 1]
                },
                "author": {
                    "name": msg.author.tag,
                    "icon_url": msg.author.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' })
                }
            }
        }, urls.length, msg.member, [
            {
                emoji: '874406183933444156',
                reactemoji: '❌',
                customid: 'delete',
                style: DiscordTypes.ButtonStyle.Danger,
                function: async (_, __, resultsMsg, collector) => {
                    collector.stop()
                    resultsMsg.delete().catch(() => { })
                },
                page: false
            }
        ], number, undefined, undefined, undefined, msg)
        return urls[page - 1]
    },
    help: {
        name: 'img/image <query> [-page <number>]',
        value: 'Search for a random image in Google.\nExample usage: p:img Burger -page 5'
    },
    cooldown: 2500,
    type: 'Fetching'
}