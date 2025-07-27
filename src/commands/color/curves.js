module.exports = {
    name: ['curves'],
    args: [{ "name": "rcurves", "required": false, "specifarg": false, "orig": "\"[rcurves]\"" }, { "name": "gcurves", "required": false, "specifarg": false, "orig": "\"[gcurves]\"" }, { "name": "bcurves", "required": false, "specifarg": false, "orig": "\"[bcurves]\"" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[4] === undefined) {
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
        var dft = ['"0/0 255/255"', '"0/0 255/255"', '"0/0 255/255"']
        var curvesregexg = /\b(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\b\/\b(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\b/g
        var matchedTextes = saidMessage.match(/"([\s\S]*?)"/g)
        if (!matchedTextes) {
            matchedTextes = dft
        } else {
            for (var i in dft) {
                var dfttext = dft[i]
                var text = matchedTextes[i]
                if (!text || !(text.match(curvesregexg) ? text.match(curvesregexg).length >= 2 : false)) {
                    matchedTextes[i] = dfttext
                }
            }
        }
        var matchfunc = (match) => {
            match = match.split('/')
            for (var i in match) {
                match[i] /= 255
            }
            return match.join('/')
        }
        var rcurves = matchedTextes[0].substring(1, matchedTextes[0].length - 1).match(curvesregexg).map(curves => curves.replace(curvesregexg, matchfunc))
        var gcurves = matchedTextes[1].substring(1, matchedTextes[1].length - 1).match(curvesregexg).map(curves => curves.replace(curvesregexg, matchfunc))
        var bcurves = matchedTextes[2].substring(1, matchedTextes[2].length - 1).match(curvesregexg).map(curves => curves.replace(curvesregexg, matchfunc))

        var currenturl = lastUrl(msg, 0)
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
                fileinfo
            })
            var filename = `input.png`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]curves=r='${rcurves.join(' ')}':g='${gcurves.join(' ')}':b='${bcurves.join(' ')}'[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo
            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]curves=r='${rcurves.join(' ')}':g='${gcurves.join(' ')}':b='${bcurves.join(' ')}',scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo
            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]curves=r='${rcurves.join(' ')}':g='${gcurves.join(' ')}':b='${bcurves.join(' ')}',split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'curves "[rcurves]" "[gcurves]" "[bcurves]" {file}',
        value: 'Gives the file a new color depending on the curve points specified.\n' +
            'Example usage: p:curves "0/0 215/47 255/255" "0/0 215/47 255/255" "0/0 215/47 255/255" https://cdn.discordapp.com/attachments/682052452740104223/944611349848264795/output.png'
    },
    cooldown: 2500,
    type: 'Color'
}