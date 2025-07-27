module.exports = {
    name: ['notclickbait', 'redcircle'],
    args: [{"name":"random","required":false,"specifarg":true,"orig":"[-random]"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]
        var saidMessage = args.slice(1).join(' ')
        var random = false
        if (saidMessage.includes('-random')) random = true
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

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/redcircle.png -filter_complex "[1:v]scale=${random ? `${(width + height) / 5}:-1` : `${squareS.constraint === 'width' ? -1 : width}:${squareS.constraint === 'height' ? -1 : height}`}[circle];[0:v][circle]overlay=x=${random ? (Math.floor(Math.random() * (width + 1)) - 1) + '-w/2' : 'W/2-w/2'}:y=${random ? (Math.floor(Math.random() * (height + 1)) - 1) + '-h/2' : 'H/2-h/2'}:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            var seed = Math.random() * 1000

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/redcircle.png -map 0:a? -filter_complex "[1:v]scale=${random ? `${(width + height) / 5}:-1` : `${squareS.constraint === 'width' ? -1 : width}:${squareS.constraint === 'height' ? -1 : height}`}[circle];[0:v][circle]overlay=x=${random ? `W*random(t*(random(0)*${seed}))-w/2` : '(W-w)/2'}:y=${random ? `H*random(t*(random(0)*${seed}))-h/2` : '(H-h)/2'}:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            var seed = Math.random() * 1000

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/redcircle.png -filter_complex "[1:v]scale=${random ? `${(width + height) / 5}:-1` : `${squareS.constraint === 'width' ? -1 : width}:${squareS.constraint === 'height' ? -1 : height}`}[circle];[0:v][circle]overlay=x=${random ? `W*random(t*(random(0)*${seed}))-w/2` : '(W-w)/2'}:y=${random ? `H*random(t*(random(0)*${seed}))-h/2` : '(H-h)/2'}:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'notclickbait/redcircle [-random] {file}',
        value: 'Real.\n' +
            'Example usage: p:notclickbait -random https://imagesvc.meredithcorp.io/v3/mm/image?q=85&c=sc&poi=face&w=2000&h=1000&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F9%2F2013%2F12%2F06%2F201307-xl-spice-roasted-pork-tenderloin-2000.jpg'
    },
    cooldown: 2500,
    type: 'Memes'
}