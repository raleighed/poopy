module.exports = {
    name: ['move'],
    args: [{"name":"x","required":true,"specifarg":false,"orig":"<x>"},{"name":"y","required":true,"specifarg":false,"orig":"<y>"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var x = isNaN(Number(args[1])) ? undefined : Number(args[1]) ?? undefined
        if (x === undefined) {
            await msg.reply('What is the X coordinate?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
        var y = isNaN(Number(args[2])) ? undefined : Number(args[2]) ?? undefined
        if (y === undefined) {
            await msg.reply('What is the Y coordinate?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
        var fileinfo = await validateFile(currenturl, true).catch(async error => {
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=rw:rh[background];[background][0:v]overlay=x=${x}:y=${y}:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -map 0:a? -filter_complex "[1:v][0:v]scale=rw:rh[background];[background][0:v]overlay=x=${x}:y=${y}:format=auto,scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=rw:rh[background];[background][0:v]overlay=x=${x}:y=${y}:format=auto,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'move <x> <y> {file}',
        value: 'Moves the file around in a transparent background.'
    },
    cooldown: 2500,
    type: 'Overlaying'
}
