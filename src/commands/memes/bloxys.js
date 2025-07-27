module.exports = {
    name: ['bloxys', 'bloxy'],
    args: [{"name":"name","required":false,"specifarg":false,"orig":"\"{name}\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars
        let { Jimp, Discord } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]
        var saidMessage = args.slice(1).join(' ')
        vars.symbolreplacements.forEach(symbolReplacement => {
            symbolReplacement.target.forEach(target => {
                saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
            })
        })
        var matchedTextes = saidMessage.match(/"([\s\S]*?)"/)
        if (!matchedTextes) {
            matchedTextes = ['""', '']
        }
        var text = matchedTextes[1]
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

        if (type.mime.startsWith('image') || type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`

            var gotham = await Jimp.loadFont(`assets/fonts/Gotham/Gotham.fnt`)
            var bloxys = await Jimp.read('assets/image/bloxys.png')
            await bloxys.print(gotham, 88, 190, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 221, 33)
            await bloxys.writeAsync(`${filepath}/bloxy.png`)

            await execPromise(`ffmpeg -stream_loop -1 -i ${filepath}/${filename} -i ${filepath}/bloxy.png -i assets/audio/bloxys.mp3 -filter_complex "[0:v]scale=219:124[frame];[1:v][frame]overlay=x=89:y=64:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -shortest -map "[out]" -preset ${findpreset(args)} -map 2:a:0 -c:v libx264 -pix_fmt yuv420p -t 00:00:07.05 -y ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
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
    help: { name: 'bloxys/bloxy "{name}" {file}', value: 'YOU WON A BLOXY!' },
    cooldown: 2500,
    type: 'Memes'
}