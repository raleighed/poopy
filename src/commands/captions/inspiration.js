module.exports = {
    name: ['meme5', 'inspiration'],
    args: [{"name":"text","required":false,"specifarg":false,"orig":"\"{text}\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"size","required":false,"specifarg":true,"orig":"[-size <multiplier (from 0.5 to 5)>]"}],
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
            matchedTextes = ['""']
        }
        for (let i = 0; i < matchedTextes.length; i++) {
            matchedTextes[i] = matchedTextes[i].replace(/\\(?=")/g, "")
        }
        var text = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
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
            var coolvetica = await Jimp.loadFont('assets/fonts/CoolveticaCondensed/CoolveticaCondensed.fnt')
            transparent.resize(width, height)
            transparent.resize(Math.round(2000 / size), Jimp.AUTO)
            await transparent.print(coolvetica, 80, 80, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            transparent.resize(width, height)
            await transparent.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -filter_complex "[0:v][1:v]overlay=x=0:y=0:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var transparent = await Jimp.read('assets/image/transparent.png')
            var coolvetica = await Jimp.loadFont('assets/fonts/CoolveticaCondensed/CoolveticaCondensed.fnt')
            transparent.resize(width, height)
            transparent.resize(Math.round(2000 / size), Jimp.AUTO)
            await transparent.print(coolvetica, 80, 80, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            transparent.resize(width, height)
            await transparent.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -map 0:a? -filter_complex "[0:v][1:v]overlay=x=0:y=0:format=auto,scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var transparent = await Jimp.read('assets/image/transparent.png')
            var coolvetica = await Jimp.loadFont('assets/fonts/CoolveticaCondensed/CoolveticaCondensed.fnt')
            transparent.resize(width, height)
            transparent.resize(Math.round(2000 / size), Jimp.AUTO)
            await transparent.print(coolvetica, 80, 80, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, transparent.bitmap.width - 160, transparent.bitmap.height - 160)
            transparent.resize(width, height)
            await transparent.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -filter_complex "[0:v][1:v]overlay=x=0:y=0:format=auto,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'meme5/inspiration "{text}" {file} [-size <multiplier (from 0.5 to 5)>]',
        value: 'Adds a centered inspirational text to the file.'
    },
    cooldown: 2500,
    type: 'Captions'
}