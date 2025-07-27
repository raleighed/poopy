module.exports = {
    name: ['snapchat'],
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
            var snapchat = await Jimp.read('assets/image/snapchat.png')
            var helvetica = await Jimp.loadFont('assets/fonts/Helvetica/Helvetica.fnt')
            snapchat.resize(width, height)
            snapchat.resize(Jimp.AUTO, Math.round(2000 / size))
            var textheight = Jimp.measureTextHeight(helvetica, text, snapchat.bitmap.width - Math.round(100 / size))
            snapchat.resize(snapchat.bitmap.width, textheight + Math.round(100 / size))
            await snapchat.print(helvetica, Math.round(50 / size), Math.round(50 / size), { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, snapchat.bitmap.width - Math.round(100 / size), snapchat.bitmap.height - Math.round(100 / size))
            snapchat.resize(width, Jimp.AUTO)
            await snapchat.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -filter_complex "[0:v][1:v]overlay=x=(W-w)/2:y=H/5*4-h/2:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var snapchat = await Jimp.read('assets/image/snapchat.png')
            var helvetica = await Jimp.loadFont('assets/fonts/Helvetica/Helvetica.fnt')
            snapchat.resize(width, height)
            snapchat.resize(Jimp.AUTO, Math.round(2000 / size))
            var textheight = Jimp.measureTextHeight(helvetica, text, snapchat.bitmap.width - Math.round(100 / size))
            snapchat.resize(snapchat.bitmap.width, textheight + Math.round(100 / size))
            await snapchat.print(helvetica, Math.round(50 / size), Math.round(50 / size), { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, snapchat.bitmap.width - Math.round(100 / size), snapchat.bitmap.height - Math.round(100 / size))
            snapchat.resize(width, Jimp.AUTO)
            await snapchat.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -map 0:a? -filter_complex "[0:v][1:v]overlay=x=(W-w)/2:y=H/5*4-h/2[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var snapchat = await Jimp.read('assets/image/snapchat.png')
            var helvetica = await Jimp.loadFont('assets/fonts/Helvetica/Helvetica.fnt')
            snapchat.resize(width, height)
            snapchat.resize(Jimp.AUTO, Math.round(2000 / size))
            var textheight = Jimp.measureTextHeight(helvetica, text, snapchat.bitmap.width - Math.round(100 / size))
            snapchat.resize(snapchat.bitmap.width, textheight + Math.round(100 / size))
            await snapchat.print(helvetica, Math.round(50 / size), Math.round(50 / size), { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, snapchat.bitmap.width - Math.round(100 / size), snapchat.bitmap.height - Math.round(100 / size))
            snapchat.resize(width, Jimp.AUTO)
            await snapchat.writeAsync(`${filepath}/caption.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/caption.png -filter_complex "[0:v][1:v]overlay=x=(W-w)/2:y=H/5*4-h/2[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'snapchat "{text}" {file} [-size <multiplier (from 0.5 to 5)>]',
        value: 'Adds a Snapchat caption to the file.'
    },
    cooldown: 2500,
    type: 'Captions'
}