module.exports = {
    name: ['twitterban'],
    args: [{"name":"message","required":false,"specifarg":false,"orig":"\"{message}\""},{"name":"nickname","required":false,"specifarg":false,"orig":"\"{nickname}\""},{"name":"username","required":false,"specifarg":false,"orig":"\"{username}\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
        var dft = ['""', `"${msg.member.displayName}"`, `"${msg.author.tag}"`]
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
        var message = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
        var nickname = matchedTextes[1].substring(1, matchedTextes[1].length - 1)
        var username = '@' + matchedTextes[2].substring(1, matchedTextes[2].length - 1)
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

            var twitter = await Jimp.read(`assets/image/twitter.png`)
            var tnr = await Jimp.loadFont('assets/fonts/TimesNewRoman/TimesNewRoman.fnt')
            var arialbold = await Jimp.loadFont('assets/fonts/ArialBold/ArialBold.fnt')
            var arialblue = await Jimp.loadFont('assets/fonts/ArialBlue/ArialBlue.fnt')
            await twitter.print(tnr, 85, 437, { text: Discord.Util.cleanContent(message, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 546, 21)
            await twitter.print(arialbold, 116, 131, { text: Discord.Util.cleanContent(nickname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 614, 12)
            await twitter.print(arialbold, 143, 379, { text: Discord.Util.cleanContent(nickname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 490, 12)
            await twitter.print(arialblue, 116, 147, { text: Discord.Util.cleanContent(username, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 614, 12)
            await twitter.print(arialblue, 143, 395, { text: Discord.Util.cleanContent(username, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 490, 12)
            await twitter.writeAsync(`${filepath}/twitter.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/twitter.png -i assets/image/twitterbg.png -filter_complex "[2:v][1:v]scale=rw:rh[bg];${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=48:48,split[frame][frame2];[bg][frame]overlay=x=59:y=134:format=auto[bframe];[bframe][frame2]overlay=x=86:y=382:format=auto[bbframe];[bbframe][1:v]overlay=x=0:y=0:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            var twitter = await Jimp.read(`assets/image/twitter.png`)
            var tnr = await Jimp.loadFont('assets/fonts/TimesNewRoman/TimesNewRoman.fnt')
            var arialbold = await Jimp.loadFont('assets/fonts/ArialBold/ArialBold.fnt')
            var arialblue = await Jimp.loadFont('assets/fonts/ArialBlue/ArialBlue.fnt')
            await twitter.print(tnr, 85, 437, { text: Discord.Util.cleanContent(message, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 546, 21)
            await twitter.print(arialbold, 116, 131, { text: Discord.Util.cleanContent(nickname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 614, 12)
            await twitter.print(arialbold, 143, 379, { text: Discord.Util.cleanContent(nickname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 490, 12)
            await twitter.print(arialblue, 116, 147, { text: Discord.Util.cleanContent(username, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 614, 12)
            await twitter.print(arialblue, 143, 395, { text: Discord.Util.cleanContent(username, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 490, 12)
            await twitter.writeAsync(`${filepath}/twitter.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/twitter.png -i assets/image/twitterbg.png -map 0:a? -filter_complex "[2:v][1:v]scale=rw:rh[bg];${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=48:48,split[frame][frame2];[bg][frame]overlay=x=59:y=134:format=auto[bframe];[bframe][frame2]overlay=x=86:y=382:format=auto[bbframe];[bbframe][1:v]overlay=x=0:y=0:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${twitter.bitmap.width}:${twitter.bitmap.height} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`)
            var filename = `input.gif`

            var twitter = await Jimp.read(`assets/image/twitter.png`)
            var tnr = await Jimp.loadFont('assets/fonts/TimesNewRoman/TimesNewRoman.fnt')
            var arialbold = await Jimp.loadFont('assets/fonts/ArialBold/ArialBold.fnt')
            var arialblue = await Jimp.loadFont('assets/fonts/ArialBlue/ArialBlue.fnt')
            await twitter.print(tnr, 85, 437, { text: Discord.Util.cleanContent(message, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 546, 21)
            await twitter.print(arialbold, 116, 131, { text: Discord.Util.cleanContent(nickname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 614, 12)
            await twitter.print(arialbold, 143, 379, { text: Discord.Util.cleanContent(nickname, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 490, 12)
            await twitter.print(arialblue, 116, 147, { text: Discord.Util.cleanContent(username, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 614, 12)
            await twitter.print(arialblue, 143, 395, { text: Discord.Util.cleanContent(username, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP }, 490, 12)
            await twitter.writeAsync(`${filepath}/twitter.png`)

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/twitter.png -i assets/image/twitterbg.png -filter_complex "[2:v][1:v]scale=rw:rh[bg];${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=48:48,split[frame][frame2];[bg][frame]overlay=x=59:y=134:format=auto[bframe];[bframe][frame2]overlay=x=86:y=382:format=auto[bbframe];[bbframe][1:v]overlay=x=0:y=0:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${twitter.bitmap.width}:${twitter.bitmap.height} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'twitterban "{message}" "{nickname}" "{username}" {file}',
        value: 'banned for hating Pan | They/Them | #BLM | #ACAB | #GAYRIGHTS | #ProudPansexual | #ProudNon-Binary | #LGBTQRIGHTS | Hates Straights'
    },
    cooldown: 2500,
    type: 'Memes'
}