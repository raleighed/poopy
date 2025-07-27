module.exports = {
    name: ['stuff'],
    args: [{"name":"text","required":false,"specifarg":false,"orig":"\"{text}\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
            var stuff = await Jimp.read('assets/image/stuff.png')
            var caption = stuff
            var white = await Jimp.read('assets/image/white.png')
            var tnr = await Jimp.loadFont('assets/fonts/TimesNewRomanBlack/TimesNewRomanBlack.fnt')
            var textheight = Jimp.measureTextHeight(tnr, text, 643)
            if (textheight > stuff.bitmap.height - 120) {
                caption = white
                white.resize(stuff.bitmap.width, textheight + 120)
                white.composite(stuff, 0, white.bitmap.height - stuff.bitmap.height)
            }
            await caption.print(tnr, 60, 60, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 643, caption.bitmap.height - 120)
            caption.resize(width, Jimp.AUTO)
            await caption.writeAsync(`${filepath}/stuff.png`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/stuff.png -filter_complex "vstack=inputs=2[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var fps = fileinfo.info.fps

            var width = fileinfo.info.width

            var stuff = await Jimp.read('assets/image/stuff.png')
            var caption = stuff
            var white = await Jimp.read('assets/white.png')
            var tnr = await Jimp.loadFont('assets/fonts/TimesNewRomanBlack/TimesNewRomanBlack.fnt')
            var textheight = Jimp.measureTextHeight(tnr, text, 643)
            if (textheight > stuff.bitmap.height - 120) {
                caption = white
                white.resize(stuff.bitmap.width, textheight + 120)
                white.composite(stuff, 0, white.bitmap.height - stuff.bitmap.height)
            }
            await caption.print(tnr, 60, 60, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 643, caption.bitmap.height - 120)
            caption.resize(width, Jimp.AUTO)
            await caption.writeAsync(`${filepath}/stuff.png`)

            await execPromise(`ffmpeg ${fps.includes('0/0') ? '' : `-r ${fps.includes('0/0') ? '50' : fps} `}-i ${filepath}/${filename} ${fps.includes('0/0') ? '' : `-r ${fps.includes('0/0') ? '50' : fps} `}-i ${filepath}/stuff.png -map 0:a? -filter_complex "vstack=inputs=2[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var fps = fileinfo.info.fps

            var width = fileinfo.info.width

            var stuff = await Jimp.read('assets/image/stuff.png')
            var caption = stuff
            var white = await Jimp.read('assets/image/white.png')
            var tnr = await Jimp.loadFont('assets/fonts/TimesNewRomanBlack/TimesNewRomanBlack.fnt')
            var textheight = Jimp.measureTextHeight(tnr, text, 643)
            if (textheight > stuff.bitmap.height - 120) {
                caption = white
                white.resize(stuff.bitmap.width, textheight + 120)
                white.composite(stuff, 0, white.bitmap.height - stuff.bitmap.height)
            }
            await caption.print(tnr, 60, 60, { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 643, caption.bitmap.height - 120)
            caption.resize(width, Jimp.AUTO)
            await caption.writeAsync(`${filepath}/stuff.png`)

            await execPromise(`ffmpeg ${fps.includes('0/0') ? '' : `-r ${fps.includes('0/0') ? '50' : fps} `}-i ${filepath}/${filename} ${fps.includes('0/0') ? '' : `-r ${fps.includes('0/0') ? '50' : fps} `}-i ${filepath}/stuff.png -filter_complex "vstack=inputs=2[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
    help: { name: 'stuff "{text}" {file}', value: "I'm stuff" },
    cooldown: 2500,
    type: 'Captions'
}