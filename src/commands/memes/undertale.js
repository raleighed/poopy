module.exports = {
    name: ['undertale', 'deltarune'],
    args: [{ "name": "text", "required": false, "specifarg": false, "orig": "\"{text}\"" }, { "name": "mode", "required": false, "specifarg": true, "orig": "[-mode <mode (regular or darkworld)>]", choices: ['regular', 'darkworld'] }, {
        "name": "boxstyle", "required": false, "specifarg": true, "orig": "[-boxstyle <style (read description)>]", "autocomplete": [
            'undertale',
            'deltarune',
            'earthbound',
            'underswap',
            'underfell',
            'octagonal',
            'shadedground',
            'tubertale',
            'stubertale',
            'fnastale',
            'derp'
        ]
    }, {
        "name": "font", "required": false, "specifarg": true, "orig": "[-font <font (read description)>]", "autocomplete": [
            'determination',
            'sans',
            'papyrus',
            'earthbound',
            'wingdings'
        ]
    }, { "name": "boxcolor", "required": false, "specifarg": true, "orig": "[-(box/asterisk)color <r> <g> <b>]" }, { "name": "asteriskcolor", "required": false, "specifarg": true, "orig": "[-(box/asterisk)color <r> <g> <b>]" }, { "name": "nofile", "required": false, "specifarg": true, "orig": "[-no(file/asterisk)]" }, { "name": "noasterisk", "required": false, "specifarg": true, "orig": "[-no(file/asterisk)]" }, { "name": "small", "required": false, "specifarg": true, "orig": "[-small]" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
    execute: async function (msg, args) {
        let poopy = this
        let vars = poopy.vars
        let {
            lastUrl, downloadFile, sendFile, fetchPingPerms,
            validateFile, execPromise, findpreset
        } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })
        var saidMessage = args.slice(1).join(' ').replace(/’/g, '\'')
        vars.symbolreplacements.forEach(symbolReplacement => {
            symbolReplacement.target.forEach(target => {
                saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
            })
        })
        var matchedTextes = saidMessage.match(/"([\s\S]*?)"/g)
        if (!matchedTextes) {
            matchedTextes = ['""']
        }
        var text = matchedTextes[0].substring(1, matchedTextes[0].length - 1)

        var asteriskrgb = 'ffffff'
        var asteriskindex = args.indexOf('-asteriskcolor')
        if (asteriskindex > -1) {
            var r = args[asteriskindex + 1]
            var g = args[asteriskindex + 2]
            var b = args[asteriskindex + 3]
            asteriskrgb = (isNaN(Number(String(r).replace(/,/g, ''))) ? 0 : Number(String(r).replace(/,/g, '')) <= 0 ? 0 : Number(String(r).replace(/,/g, '')) >= 255 ? 255 : Number(String(r).replace(/,/g, '')) || 0).toString(16).padStart(2, '0') +
                (isNaN(Number(String(g).replace(/,/g, ''))) ? 0 : Number(String(g).replace(/,/g, '')) <= 0 ? 0 : Number(String(g).replace(/,/g, '')) >= 255 ? 255 : Number(String(g).replace(/,/g, '')) || 0).toString(16).padStart(2, '0') +
                (isNaN(Number(String(b).replace(/,/g, ''))) ? 0 : Number(String(b).replace(/,/g, '')) <= 0 ? 0 : Number(String(b).replace(/,/g, '')) >= 255 ? 255 : Number(String(b).replace(/,/g, '')) || 0).toString(16).padStart(2, '0')
        }

        if (args.find(arg => arg === '-noasterisk')) {
            asteriskrgb = 'null'
        }

        var boxrgb = 'ffffff'
        var boxindex = args.indexOf('-boxcolor')
        if (boxindex > -1) {
            var r = args[boxindex + 1]
            var g = args[boxindex + 2]
            var b = args[boxindex + 3]
            boxrgb = (isNaN(Number(String(r).replace(/,/g, ''))) ? 0 : Number(String(r).replace(/,/g, '')) <= 0 ? 0 : Number(String(r).replace(/,/g, '')) >= 255 ? 255 : Number(String(r).replace(/,/g, '')) || 0).toString(16).padStart(2, '0') +
                (isNaN(Number(String(g).replace(/,/g, ''))) ? 0 : Number(String(g).replace(/,/g, '')) <= 0 ? 0 : Number(String(g).replace(/,/g, '')) >= 255 ? 255 : Number(String(g).replace(/,/g, '')) || 0).toString(16).padStart(2, '0') +
                (isNaN(Number(String(b).replace(/,/g, ''))) ? 0 : Number(String(b).replace(/,/g, '')) <= 0 ? 0 : Number(String(b).replace(/,/g, '')) >= 255 ? 255 : Number(String(b).replace(/,/g, '')) || 0).toString(16).padStart(2, '0')
        }

        var mode = 'regular'
        var modeindex = args.indexOf('-mode')
        if (modeindex > -1) {
            if (args[modeindex + 1]) {
                style = ['regular', 'darkworld'].find(st => st === args[modeindex + 1].toLowerCase()) ? args[modeindex + 1].toLowerCase() : 'regular'
            }
        }

        var xpoint = 8
        var ypoint = 8

        var style = 'undertale'
        var styleindex = args.indexOf('-boxstyle')
        if (styleindex > -1) {
            if (args[styleindex + 1]) {
                style = ['undertale', 'deltarune', 'earthbound', 'underswap', 'underfell', 'octagonal', 'shadedground', 'tubertale', 'stubertale', 'fnastale', 'derp'].find(st => st === args[styleindex + 1].toLowerCase()) ? args[styleindex + 1].toLowerCase() : 'undertale'
            }
        }

        if (style === 'deltarune') {
            xpoint = 12
            ypoint = 12
        }

        var font = 'determination'
        var fontindex = args.indexOf('-font')
        if (fontindex > -1) {
            if (args[fontindex + 1]) {
                font = ['determination', 'sans', 'papyrus', 'earthbound', 'wingdings'].find(st => st === args[fontindex + 1].toLowerCase()) ? args[fontindex + 1].toLowerCase() : 'determination'
            }
        }

        var nopic = false
        var currenturl = !(saidMessage.includes('-nofile')) ? (lastUrl(msg, 0) || args[1]) : undefined
        if (!currenturl) nopic = true

        if (nopic) {
            var filepath = await downloadFile(`https://www.demirramon.com/gen/undertale_text_box.png?text=${encodeURIComponent(text)}&box=${style}&boxcolor=${boxrgb}&font=${font}&asterisk=${asteriskrgb}&mode=${mode}&small=${!!args.find(arg => arg === '-small')}`, `output.png`, {
                http: true
            })

            return await sendFile(msg, filepath, `output.png`)
            return
        }

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
            await downloadFile(`https://www.demirramon.com/gen/undertale_text_box.png?text=${encodeURIComponent(text)}&box=${style}&boxcolor=${boxrgb}&character=blank&font=${font}&asterisk=${asteriskrgb}&mode=${mode}&small=true`, 'box.png', {
                http: true,
                filepath: filepath
            })

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/box.png -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 58 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 58 : -1}[frame];[1:v][frame]overlay=x=${xpoint}+(58/2-w/2):y=${ypoint}+(60/2-h/2):format=auto${!(args.find(arg => arg === '-small')) ? `,scale=iw*2:ih*2:flags=neighbor` : ''}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await downloadFile(`https://www.demirramon.com/gen/undertale_text_box.png?text=${encodeURIComponent(text)}&box=${style}&boxcolor=${boxrgb}&character=blank&font=${font}&asterisk=${asteriskrgb}&mode=${mode}&small=true`, 'box.png', {
                http: true,
                filepath: filepath
            })

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/box.png -map 0:a? -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 58 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 58 : -1}[frame];[1:v][frame]overlay=x=${xpoint}+(58/2-w/2):y=${ypoint}+(60/2-h/2):format=auto${!(args.find(arg => arg === '-small')) ? `,scale=iw*2:ih*2:flags=neighbor` : ''},scale=ceil(iw/2)*2:ceil(ih/2)*2:flags=neighbor[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await downloadFile(`https://www.demirramon.com/gen/undertale_text_box.png?text=${encodeURIComponent(text)}&box=${style}&boxcolor=${boxrgb}&character=blank&font=${font}&asterisk=${asteriskrgb}&mode=${mode}&small=true`, 'box.png', {
                http: true,
                filepath: filepath
            })

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/box.png -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 58 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 58 : -1}[frame];[1:v][frame]overlay=x=${xpoint}+(58/2-w/2):y=${ypoint}+(60/2-h/2):format=auto${!(args.find(arg => arg === '-small')) ? `,scale=iw*2:ih*2:flags=neighbor` : ''},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'undertale/deltarune "{text}" [-mode <mode (regular or darkworld)>] [-boxstyle <style (read description)>] [-font <font (read description)>] [-(box/asterisk)color <r> <g> <b>] [-no(file/asterisk)] [-small] {file}',
        value: 'story of undertale!!! A list of available box styles are undertale, deltarune, earthbound, underswap, underfell, octagonal, shadedground, tubertale, stubertale, fnastale and derp. Fonts are determination, sans, papyrus, earthbound and wingdings. More info on https://www.demirramon.com/help/undertale_text_box_generator. Try it yourself at https://www.demirramon.com/generators/undertale_text_box_generator'
    },
    cooldown: 2500,
    type: 'Memes'
}