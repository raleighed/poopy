module.exports = {
    name: ['countdown', 'annoyingorange'],
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var transparent = await Jimp.read(`assets/image/transparent.png`)
            var novecento = await Jimp.loadFont(`assets/fonts/Novecento/Novecento.fnt`)
            transparent.resize(101, 28)
            await transparent.print(novecento, 0, 0, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 101, 28)
            await transparent.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -vf "scale=66:66" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/scaled.mp4`)
            await execPromise(`ffmpeg -stream_loop -1 -i ${filepath}/scaled.mp4 -i ${filepath}/caption.png -i assets/video/countdown.mp4 -filter_complex "[2:v][0:v]overlay=shortest=1:x=2:y=3:format=auto[image];[image][1:v]overlay=x=89:y=4:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`
            var transparent = await Jimp.read(`assets/image/transparent.png`)
            var novecento = await Jimp.loadFont(`assets/fonts/Novecento/Novecento.fnt`)
            transparent.resize(101, 28)
            await transparent.print(novecento, 0, 0, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 101, 28)
            await transparent.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -vf "scale=66:66" -preset ${findpreset(args)} ${filepath}/scaled.png`)
            await execPromise(`ffmpeg -stream_loop -1 -i ${filepath}/scaled.png -i ${filepath}/caption.png -i assets/video/countdown.mp4 -filter_complex "[2:v][0:v]overlay=shortest=1:x=2:y=3:format=auto[image];[image][1:v]overlay=x=89:y=4:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var transparent = await Jimp.read(`assets/image/transparent.png`)
            var novecento = await Jimp.loadFont(`assets/fonts/Novecento/Novecento.fnt`)
            transparent.resize(101, 28)
            await transparent.print(novecento, 0, 0, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 101, 28)
            await transparent.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=66:66,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/scaled.gif`)
            await execPromise(`ffmpeg -stream_loop -1 -i ${filepath}/scaled.gif -i ${filepath}/caption.png -i assets/video/countdown.mp4 -filter_complex "[2:v][0:v]overlay=shortest=1:x=2:y=3:format=auto[image];[image][1:v]overlay=x=89:y=4:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
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
    help: { name: 'countdown/annoyingorange "{name}" {file}', value: 'oh no' },
    cooldown: 2500,
    type: 'Memes'
}