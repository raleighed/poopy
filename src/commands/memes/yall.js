module.exports = {
    name: ['yall', 'twitterartist'],
    args: [{"name":"text","required":false,"specifarg":false,"orig":"\"[text]\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
        if (lastUrl(msg, 0) === undefined && vars.validUrl.test(args[args.length - 1]) === false) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
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
        var currenturl = lastUrl(msg, 0) || args[1]
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
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`

            var yall = await Jimp.read(`assets/image/yall.png`)
            var morton = await Jimp.loadFont('assets/fonts/Morton/Morton.fnt')
            await yall.print(morton, 274, 8, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 202, 77)
            await yall.writeAsync(`${filepath}/yall.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/yall.png -i assets/image/transparent.png -filter_complex "[2:v]scale=249:368[transparent];[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 368 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 368 : -1}[frame];[transparent][frame]overlay=x=W/2-w/2:y=H/2-h/2:format=auto[cframe];[1:v][cframe]overlay=x=251:y=94:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            var yall = await Jimp.read(`assets/image/yall.png`)
            var morton = await Jimp.loadFont('assets/fonts/Morton/Morton.fnt')
            await yall.print(morton, 274, 8, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 202, 77)
            await yall.writeAsync(`${filepath}/yall.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/yall.png -i assets/image/transparent.png -map 0:a? -filter_complex "[2:v]scale=249:368[transparent];[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 368 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 368 : -1}[frame];[transparent][frame]overlay=x=W/2-w/2:y=H/2-h/2:format=auto[cframe];[1:v][cframe]overlay=x=251:y=94:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`)
            var filename = `input.gif`

            var yall = await Jimp.read(`assets/image/yall.png`)
            var morton = await Jimp.loadFont('assets/fonts/Morton/Morton.fnt')
            await yall.print(morton, 274, 8, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 202, 77)
            await yall.writeAsync(`${filepath}/yall.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/yall.png -i assets/image/transparent.png -filter_complex "[2:v]scale=249:368[transparent];[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 368 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 368 : -1}[frame];[transparent][frame]overlay=x=W/2-w/2:y=H/2-h/2:format=auto[cframe];[1:v][cframe]overlay=x=251:y=94:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
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
        name: 'yall/twitterartist "[text]" {file}',
        value: 'twitter artist'
    },
    cooldown: 2500,
    type: 'Memes'
}