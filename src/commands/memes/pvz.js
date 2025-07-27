module.exports = {
    name: ['pvz', 'plant'],
    args: [{"name":"name","required":false,"specifarg":false,"orig":"\"{name}\""},{"name":"description","required":false,"specifarg":false,"orig":"\"{description}\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
        var saidMessage = args.slice(1).join(' ').replace(/’/g, '\'')
        vars.symbolreplacements.forEach(symbolReplacement => {
            symbolReplacement.target.forEach(target => {
                saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
            })
        })
        var matchedTextes = saidMessage.match(/"([\s\S]*?)"/g)
        if (!matchedTextes) {
            matchedTextes = ['""', '""']
        } else if (!matchedTextes[1]) {
            matchedTextes[1] = '""'
        }
        var plantname = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
        var plantdescription = matchedTextes[1].substring(1, matchedTextes[1].length - 1)
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

            var pvz = await Jimp.read(`assets/image/pvz.png`)
            var dwarven = await Jimp.loadFont('assets/fonts/Dwarven/Dwarven.fnt')
            var brianne = await Jimp.loadFont('assets/fonts/Brianne/Brianne.fnt')
            await pvz.print(dwarven, 155, 186, { text: Discord.Util.cleanContent(plantname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 189, 27)
            await pvz.print(brianne, 166, 223, { text: Discord.Util.cleanContent(plantdescription, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 166, 66)
            await pvz.writeAsync(`${filepath}/pvz.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/pvz.png -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 40 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 40 : -1}[frame];[1:v][frame]overlay=x=W/2-w/2:y=118-h/2:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            var pvz = await Jimp.read(`assets/image/pvz.png`)
            var dwarven = await Jimp.loadFont('assets/fonts/Dwarven/Dwarven.fnt')
            var brianne = await Jimp.loadFont('assets/fonts/Brianne/Brianne.fnt')
            await pvz.print(dwarven, 155, 186, { text: Discord.Util.cleanContent(plantname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 189, 27)
            await pvz.print(brianne, 166, 223, { text: Discord.Util.cleanContent(plantdescription, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 166, 66)
            await pvz.writeAsync(`${filepath}/pvz.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/pvz.png -map 0:a? -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 40 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 40 : -1}[frame];[1:v][frame]overlay=x=W/2-w/2:y=118-h/2:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`)
            var filename = `input.gif`

            var pvz = await Jimp.read(`assets/image/pvz.png`)
            var dwarven = await Jimp.loadFont('assets/fonts/Dwarven/Dwarven.fnt')
            var brianne = await Jimp.loadFont('assets/fonts/Brianne/Brianne.fnt')
            await pvz.print(dwarven, 155, 186, { text: Discord.Util.cleanContent(plantname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 189, 27)
            await pvz.print(brianne, 166, 223, { text: Discord.Util.cleanContent(plantdescription, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 166, 66)
            await pvz.writeAsync(`${filepath}/pvz.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/pvz.png -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 40 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 40 : -1}[frame];[1:v][frame]overlay=x=W/2-w/2:y=118-h/2:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'pvz/plant "{name}" "{description}" {file}',
        value: 'You got a new plant!'
    },
    cooldown: 2500,
    type: 'Memes'
}