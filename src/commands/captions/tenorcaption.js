module.exports = {
    name: ['meme4', 'tenorcaption'],
    args: [{"name":"topText","required":false,"specifarg":false,"orig":"\"{topText}\""},{"name":"bottomText","required":false,"specifarg":false,"orig":"\"[bottomText]\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"color","required":false,"specifarg":true,"orig":"[-color <r> <g> <b>]"},{"name":"size","required":false,"specifarg":true,"orig":"[-size <multiplier (from 0.5 to 5)>]"}],
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
        var size = 1
        var sizeindex = args.indexOf('-size')
        if (sizeindex > -1) {
            size = isNaN(Number(args[sizeindex + 1])) ? 1 : Number(args[sizeindex + 1]) <= 0.5 ? 0.5 : Number(args[sizeindex + 1]) >= 5 ? 5 : Number(args[sizeindex + 1]) || 1
        }
        var saidMessage = args.slice(1).join(' ').replace(/’/g, '\'')
        vars.symbolreplacements.forEach(symbolReplacement => {
            symbolReplacement.target.forEach(target => {
                saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
            })
        })
        var matchedTextes = saidMessage.match(/(?<!\\)"([\s\S]*?)(?<!\\)"/g)
        if (!matchedTextes) {
            matchedTextes = ['""', '""']
        } else if (!matchedTextes[1]) {
            matchedTextes[1] = '""'
        }
        for (let i = 0; i < matchedTextes.length; i++) {
            matchedTextes[i] = matchedTextes[i].replace(/\\(?=")/g, "")
        }
        var text = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
        var text2 = matchedTextes[1].substring(1, matchedTextes[1].length - 1)
        var rgb = {
            r: 255,
            g: 255,
            b: 255,
        }
        var colorindex = args.indexOf('-color')
        if (colorindex > -1) {
            var r = args[colorindex + 1]
            var g = args[colorindex + 2]
            var b = args[colorindex + 3]
            rgb.r = isNaN(Number(String(r).replace(/,/g, ''))) ? 0 : Number(String(r).replace(/,/g, '')) <= 0 ? 0 : Number(String(r).replace(/,/g, '')) >= 255 ? 255 : Number(String(r).replace(/,/g, '')) || 0
            rgb.g = isNaN(Number(String(g).replace(/,/g, ''))) ? 0 : Number(String(g).replace(/,/g, '')) <= 0 ? 0 : Number(String(g).replace(/,/g, '')) >= 255 ? 255 : Number(String(g).replace(/,/g, '')) || 0
            rgb.b = isNaN(Number(String(b).replace(/,/g, ''))) ? 0 : Number(String(b).replace(/,/g, '')) <= 0 ? 0 : Number(String(b).replace(/,/g, '')) >= 255 ? 255 : Number(String(b).replace(/,/g, '')) || 0
        }
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
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var transparent = await Jimp.read('assets/image/transparent.png')
            var ubuntu = await Jimp.loadFont('assets/fonts/Ubuntu/Ubuntu.fnt')
            transparent.resize(width, height)
            transparent.resize(Math.round(2000 / size), Jimp.AUTO)
            var transparent2 = transparent.clone()
            await transparent.print(ubuntu, 80, 80, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            await transparent2.print(ubuntu, 80, 80, { text: Discord.Util.cleanContent(text2, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            transparent.resize(width, height)
            transparent2.resize(width, height)
            await transparent.writeAsync(`${filepath}/caption.png`)
            await transparent2.writeAsync(`${filepath}/caption2.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -i ${filepath}/caption2.png -filter_complex "[1:v]curves=r='0/0 1/${rgb.r / 255}':g='0/0 1/${rgb.g / 255}':b='0/0 1/${rgb.b / 255}'[top];[2:v]curves=r='0/0 1/${rgb.r / 255}':g='0/0 1/${rgb.g / 255}':b='0/0 1/${rgb.b / 255}'[bottom];[0:v][top]overlay=x=0:y=0:format=auto[caption];[caption][bottom]overlay=x=0:y=0:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var transparent = await Jimp.read('assets/image/transparent.png')
            var ubuntu = await Jimp.loadFont('assets/fonts/Ubuntu/Ubuntu.fnt')
            transparent.resize(width, height)
            transparent.resize(Math.round(2000 / size), Jimp.AUTO)
            var transparent2 = transparent.clone()
            await transparent.print(ubuntu, 80, 80, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            await transparent2.print(ubuntu, 80, 80, { text: Discord.Util.cleanContent(text2, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            transparent.resize(width, height)
            transparent2.resize(width, height)
            await transparent.writeAsync(`${filepath}/caption.png`)
            await transparent2.writeAsync(`${filepath}/caption2.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -i ${filepath}/caption2.png -map 0:a? -filter_complex "[1:v]curves=r='0/0 1/${rgb.r / 255}':g='0/0 1/${rgb.g / 255}':b='0/0 1/${rgb.b / 255}'[top];[2:v]curves=r='0/0 1/${rgb.r / 255}':g='0/0 1/${rgb.g / 255}':b='0/0 1/${rgb.b / 255}'[bottom];[0:v][top]overlay=x=0:y=0:format=auto[caption];[caption][bottom]overlay=x=0:y=0:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var transparent = await Jimp.read('assets/image/transparent.png')
            var ubuntu = await Jimp.loadFont('assets/fonts/Ubuntu/Ubuntu.fnt')
            transparent.resize(width, height)
            transparent.resize(Math.round(2000 / size), Jimp.AUTO)
            var transparent2 = transparent.clone()
            await transparent.print(ubuntu, 80, 80, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            await transparent2.print(ubuntu, 80, 80, { text: Discord.Util.cleanContent(text2, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            transparent.resize(width, height)
            transparent2.resize(width, height)
            await transparent.writeAsync(`${filepath}/caption.png`)
            await transparent2.writeAsync(`${filepath}/caption2.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -i ${filepath}/caption2.png -filter_complex "[1:v]curves=r='0/0 1/${rgb.r / 255}':g='0/0 1/${rgb.g / 255}':b='0/0 1/${rgb.b / 255}'[top];[2:v]curves=r='0/0 1/${rgb.r / 255}':g='0/0 1/${rgb.g / 255}':b='0/0 1/${rgb.b / 255}'[bottom];[0:v][top]overlay=x=0:y=0:format=auto[caption];[caption][bottom]overlay=x=0:y=0:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'meme4/tenorcaption "{topText}" "[bottomText]" {file} [-color <r> <g> <b>] [-size <multiplier (from 0.5 to 5)>]',
        value: 'Adds a Tenor GIF caption to the file.\n' +
            'Example usage: p:tenorcaption "You putrid fool" https://cdn.discordapp.com/attachments/691444857108955196/855507735750901831/output.png -color 255 0 0'
    },
    cooldown: 2500,
    type: 'Captions'
}