module.exports = {
    name: ['robloxgame', 'rgame'],
    args: [{"name":"name","required":false,"specifarg":false,"orig":"\"{name}\""},{"name":"likeRatio","required":false,"specifarg":false,"orig":"\"[likeRatio]\""},{"name":"playerCount","required":false,"specifarg":false,"orig":"\"[playerCount]\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
        var dft = ['""', '"88"', '"1.3K"']
        var matchedTextes = saidMessage.match(/"([\s\S]*?)"/g)
        if (!matchedTextes) {
            matchedTextes = dft
        } else {
            for (var i in dft) {
                var dfttext = dft[i]
                var text = matchedTextes[i]
                if (!text) {
                    matchedTextes[i] = dfttext
                }
            }
        }
        var name = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
        var likepercentage = matchedTextes[1].substring(1, matchedTextes[1].length - 1) + '%'
        var playercount = matchedTextes[2].substring(1, matchedTextes[2].length - 1)
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

            var game = await Jimp.read(`assets/image/game.png`)
            var gothamed = await Jimp.loadFont('assets/fonts/GothamMedium/GothamMedium.fnt')
            var gothasm = await Jimp.loadFont('assets/fonts/GothamSmall/GothamSmall.fnt')
            await game.print(gothamed, 5, 165, { text: Discord.Util.cleanContent(name, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 150, 35)
            await game.print(gothasm, 22, 211, { text: Discord.Util.cleanContent(likepercentage, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 138, 17)
            await game.print(gothasm, 79, 211, { text: Discord.Util.cleanContent(playercount, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 81, 17)
            await game.writeAsync(`${filepath}/game.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/game.png -i assets/image/gamebg.png -filter_complex "[2:v][1:v]scale2ref[bg][game];${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=150:150[frame];[bg][frame]overlay=x=5:y=4:format=auto[bframe];[bframe][game]overlay=x=0:y=0:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            var game = await Jimp.read(`assets/image/game.png`)
            var gothamed = await Jimp.loadFont('assets/fonts/GothamMedium/GothamMedium.fnt')
            var gothasm = await Jimp.loadFont('assets/fonts/GothamSmall/GothamSmall.fnt')
            await game.print(gothamed, 5, 165, { text: Discord.Util.cleanContent(name, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 150, 35)
            await game.print(gothasm, 22, 211, { text: Discord.Util.cleanContent(likepercentage, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 138, 17)
            await game.print(gothasm, 79, 211, { text: Discord.Util.cleanContent(playercount, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 81, 17)
            await game.writeAsync(`${filepath}/game.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/game.png -i assets/image/gamebg.png -map 0:a? -filter_complex "[2:v][1:v]scale2ref[bg][game];${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=150:150[frame];[bg][frame]overlay=x=5:y=4:format=auto[bframe];[bframe][game]overlay=x=0:y=0:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${game.bitmap.width}:${game.bitmap.height} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`)
            var filename = `input.gif`

            var game = await Jimp.read(`assets/image/game.png`)
            var gothamed = await Jimp.loadFont('assets/fonts/GothamMedium/GothamMedium.fnt')
            var gothasm = await Jimp.loadFont('assets/fonts/GothamSmall/GothamSmall.fnt')
            await game.print(gothamed, 5, 165, { text: Discord.Util.cleanContent(name, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 150, 35)
            await game.print(gothasm, 22, 211, { text: Discord.Util.cleanContent(likepercentage, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 138, 17)
            await game.print(gothasm, 79, 211, { text: Discord.Util.cleanContent(playercount, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 81, 17)
            await game.writeAsync(`${filepath}/game.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/game.png -i assets/image/gamebg.png -filter_complex "[2:v][1:v]scale2ref[bg][game];${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=150:150[frame];[bg][frame]overlay=x=5:y=4:format=auto[bframe];[bframe][game]overlay=x=0:y=0:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${game.bitmap.width}:${game.bitmap.height} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'robloxgame/rgame "{name}" "[likeRatio]" "[playerCount]" {file}',
        value: 'Power your imagination.'
    },
    cooldown: 2500,
    type: 'Memes'
}