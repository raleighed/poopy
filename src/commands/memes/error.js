module.exports = {
    name: ['error', 'warning'],
    args: [{ "name": "title", "required": false, "specifarg": false, "orig": "\"{title}\"" }, { "name": "message", "required": false, "specifarg": false, "orig": "\"{message}\"" }, { "name": "leftbutton", "required": false, "specifarg": false, "orig": "\"[leftbutton]\"" }, { "name": "lgray", "required": false, "specifarg": true, "orig": "[-lgray]" }, { "name": "centerbutton", "required": false, "specifarg": false, "orig": "\"[centerbutton]\"" }, { "name": "cgray", "required": false, "specifarg": true, "orig": "[-cgray]" }, { "name": "rightbutton", "required": false, "specifarg": false, "orig": "\"[rightbutton]\"" }, { "name": "rgray", "required": false, "specifarg": true, "orig": "[-rgray]" }, { "name": "style", "required": false, "specifarg": true, "orig": "[-style <style (98 or XP)>]", "autocomplete": ['xp', '98'] }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

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
        var dft = ['""', '""', '""', '""', '""']
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
        var title = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
        var text = matchedTextes[1].substring(1, matchedTextes[1].length - 1)
        var b1 = matchedTextes[2].substring(1, matchedTextes[2].length - 1)
        var b2 = matchedTextes[3].substring(1, matchedTextes[3].length - 1)
        var b3 = matchedTextes[4].substring(1, matchedTextes[4].length - 1)
        var b1g = ''
        var b2g = ''
        var b3g = ''
        if (saidMessage.includes('-lgray')) b1g = 'x'
        if (saidMessage.includes('-cgray')) b2g = 'x'
        if (saidMessage.includes('-rgray')) b3g = 'x'
        var style = 'xp'
        var styleindex = args.indexOf('-style')
        if (styleindex > -1) {
            if (args[styleindex + 1]) {
                style = ['xp', '98'].find(st => st === args[styleindex + 1].toLowerCase()) ? args[styleindex + 1].toLowerCase() : 'xp'
            }
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
            await downloadFile(`http://atom.smasher.org/error/${encodeURIComponent(style)}.png.php?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&b1=${encodeURIComponent(b1)}&b1g=${encodeURIComponent(b1g)}&b2=${encodeURIComponent(b2)}&b2g=${encodeURIComponent(b2g)}&b3=${encodeURIComponent(b3)}&b3g=${encodeURIComponent(b3g)}`, 'error.png', {
                http: true,
                filepath: filepath
            })

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/error.png -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 34 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 34 : -1}[frame];[1:v][frame]overlay=x=15+(34/2-w/2):y=36+(34/2-h/2):format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await downloadFile(`http://atom.smasher.org/error/${encodeURIComponent(style)}.png.php?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&b1=${encodeURIComponent(b1)}&b1g=${encodeURIComponent(b1g)}&b2=${encodeURIComponent(b2)}&b2g=${encodeURIComponent(b2g)}&b3=${encodeURIComponent(b3)}&b3g=${encodeURIComponent(b3g)}`, 'error.png', {
                http: true,
                filepath: filepath
            })

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/error.png -map 0:a? -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 34 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 34 : -1}[frame];[1:v][frame]overlay=x=15+(34/2-w/2):y=36+(34/2-h/2):format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await downloadFile(`http://atom.smasher.org/error/${encodeURIComponent(style)}.png.php?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&b1=${encodeURIComponent(b1)}&b1g=${encodeURIComponent(b1g)}&b2=${encodeURIComponent(b2)}&b2g=${encodeURIComponent(b2g)}&b3=${encodeURIComponent(b3)}&b3g=${encodeURIComponent(b3g)}`, 'error.png', {
                http: true,
                filepath: filepath
            })

            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/error.png -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 34 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 34 : -1}[frame];[1:v][frame]overlay=x=15+(34/2-w/2):y=36+(34/2-h/2):format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'error/warning "{title}" "{message}" "[leftbutton]" [-lgray] "[centerbutton]" [-cgray] "[rightbutton]" [-rgray] [-style <style (98 or XP)>] {file}',
        value: 'Sonic is hacking your computer'
    },
    cooldown: 2500,
    type: 'Memes'
}