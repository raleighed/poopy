module.exports = {
    name: ['melt', 'trippy'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"decay","required":false,"specifarg":true,"orig":"[-decay <percentage>]"},{"name":"loop","required":false,"specifarg":true,"orig":"[-loop]"}],
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
        var decay = 95
        var decayindex = args.indexOf('-decay')
        if (decayindex > -1) {
            decay = isNaN(Number(args[decayindex + 1])) ? 95 : Number(args[decayindex + 1]) <= 0 ? 0 : Number(args[decayindex + 1]) >= 100 ? 100 : Number(args[decayindex + 1]) ?? 95
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)

            await execPromise(args.indexOf('-loop') > -1 ? `ffmpeg -stream_loop 1 -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]lagfun=decay=${decay / 100},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p -ss ${iduration} ${filepath}/output.mp4` : `ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]lagfun=decay=${decay / 100},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)

            await execPromise(args.indexOf('-loop') > -1 ? `ffmpeg -stream_loop 1 -i ${filepath}/${filename} -i assets/image/black.png -filter_complex "[1:v][0:v]scale=rw:rh[black];[black]split[blackw][blackn];[0:v]hue=b=10[white];[blackw][white]overlay=x=0:y=0:format=auto,lagfun=decay=${decay / 100}[meltalpha];[blackn][0:v]overlay=x=0:y=0:format=auto,lagfun=decay=${decay / 100}[melt];[melt][meltalpha]alphamerge,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting -ss ${iduration} ${filepath}/output.gif` : `ffmpeg -i ${filepath}/${filename} -i assets/image/black.png -filter_complex "[1:v][0:v]scale=rw:rh[black];[black]split[blackw][blackn];[0:v]hue=b=10[white];[blackw][white]overlay=x=0:y=0:format=auto,lagfun=decay=${decay / 100}[meltalpha];[blackn][0:v]overlay=x=0:y=0:format=auto,lagfun=decay=${decay / 100}[melt];[melt][meltalpha]alphamerge,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'melt/trippy {file} [-decay <percentage>] [-loop]',
        value: 'Adds a trippy melting effect to the file. Default decay is 95.'
    },
    cooldown: 2500,
    type: 'Effects'
}