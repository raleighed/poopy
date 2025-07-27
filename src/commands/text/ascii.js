module.exports = {
    name: ['ascii', 'braille'],
    args: [{"name":"negative","required":false,"specifarg":true,"orig":"[-negative]"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let { lastUrl, validateFile, braille } = poopy.functions
        let vars = poopy.vars
        let config = poopy.config
        let { fs, Discord } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0, true) === undefined && args[1] === undefined) {
            await msg.reply('What is the image to asciify?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0, true) || args[1]
        var saidMessage = args.slice(1).join(' ')
        var negative = false
        if (saidMessage.includes('-negative')) negative = true
        var fileinfo = await validateFile(currenturl).catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        })

        if (!fileinfo) return
        var type = fileinfo.type

        if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var brailleText = await braille(currenturl, negative)
            if (!msg.nosend) await msg.reply({
                content: brailleText,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(async () => {
                var currentcount = vars.filecount
                vars.filecount++
                var filepath = `temp/${config.database}/file${currentcount}`
                fs.mkdirSync(`${filepath}`)
                fs.writeFileSync(`${filepath}/ascii.txt`, brailleText)
                await msg.reply({
                    files: [new Discord.AttachmentBuilder(`${filepath}/ascii.txt`)]
                }).catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
            })
            return brailleText
        } else {
            await msg.reply({
                content: `Unsupported file: \`${currenturl}\``,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        }
    },
    help: {
        name: 'ascii/braille [-negative] {file}',
        value: 'Converts the image to ASCII.\n' +
            'Example usage: p:ascii -negative https://cdn.discordapp.com/emojis/827634704722165783.png'
    },
    cooldown: 2500,
    type: 'Text'
}