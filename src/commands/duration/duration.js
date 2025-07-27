module.exports = {
    name: ['duration', 'stretch'],
    args: [{"name":"seconds","required":true,"specifarg":false,"orig":"<seconds (6 x fileduration, min 1 minute)>"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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

        var maxDuration = Math.max(60, isNaN(Number(args[1])) ? 0 : Number(args[1])*6)
        var duration = isNaN(Number(args[1])) ? undefined : Number(args[1]) <= 0 ? 0 : Number(args[1]) >= maxDuration ? maxDuration : Number(args[1]) || undefined
        if (duration === undefined) {
            await msg.reply('What is the duration?!').catch(() => { })
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var fps = fileinfo.info.fps
            var iduration = Number(fileinfo.info.duration)
            var audio = fileinfo.info.audio

            if (audio) {
                var smult = iduration / duration
                var speedfilter = []

                if (smult < 0.5) while (smult < 0.5) {
                    smult *= 2
                    speedfilter.push(`atempo=0.5`)
                } else if (smult > 2) while (smult > 2) {
                    smult /= 2
                    speedfilter.push(`atempo=2`)
                }

                speedfilter.push(`atempo=${smult}`)
                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]fps=fps='min(60,${fps.includes('0/0') ? '60' : fps}*(${iduration / duration}))',setpts=PTS/(${iduration / duration}),scale=ceil(iw/2)*2:ceil(ih/2)*2[v];[0:a]${speedfilter.join(',')}[a]" -map "[v]" -map "[a]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            } else {
                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]fps=fps='min(60,${fps.includes('0/0') ? '60' : fps}*(${iduration / duration}))',setpts=PTS/(${iduration / duration}),scale=ceil(iw/2)*2:ceil(ih/2)*2[v]" -map "[v]" -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            }
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            var iduration = Number(fileinfo.info.duration)
            var smult = iduration / duration
            var speedfilter = []

            if (smult < 0.5) while (smult < 0.5) {
                smult *= 2
                speedfilter.push(`atempo=0.5`)
            } else if (smult > 2) while (smult > 2) {
                smult /= 2
                speedfilter.push(`atempo=2`)
            }

            speedfilter.push(`atempo=${smult}`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:a]${speedfilter.join(',')}[a]" -map "[a]" -preset ${findpreset(args)} ${filepath}/output.mp3`)
            return await sendFile(msg, filepath, `output.mp3`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var fps = fileinfo.info.fps
            var iduration = Number(fileinfo.info.duration)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]fps=fps='min(50,${fps.includes('0/0') ? '50' : fps}*(${iduration / duration}))',setpts=PTS/(${iduration / duration}),split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'duration/stretch <seconds (6 x fileduration, min 1 minute)> {file}',
        value: 'Stretches the file to match the supplied duration in seconds.'
    },
    cooldown: 2500,
    type: 'Duration'
}
