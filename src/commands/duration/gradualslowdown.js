module.exports = {
    name: ['gradualslowdown', 'gradualslow'],
    args: [{"name":"multiplier","required":false,"specifarg":false,"orig":"[multiplier <number (from 1 to 2)>]"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, fetchPingPerms,
            execPromise, findpreset, validateFileFromPath, sendFile
        } = poopy.functions
        let { fs } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var speed = isNaN(Number(args[1])) ? 2 : Number(args[1]) <= 1 ? 1 : Number(args[1]) >= 2 ? 2 : Number(args[1]) || 2
        var gradual = []
        var n = 100
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
            var audio = fileinfo.info.audio

            if (audio) {
                var fps = fileinfo.info.fps
                var duration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)
                var aduration = Number(fileinfo.info.aduration.includes('N/A') ? '0' : fileinfo.info.aduration)
                var ratio = aduration / duration
                var total = 0
                var f = duration / n
                var ptsvalue = '{next}'

                for (var i = 0; i < n; i++) {
                    var a = i / (n - 1)
                    var a2 = i / n
                    var a3 = (i + 1) / n
                    var start = duration * a2
                    var end = start + f
                    total += f * Math.lerp(1, speed, a)
                    gradual.push({
                        audio: `[ga${i + 1}]`,
                        filter: `[0:a]atrim=${start}:${end}${i != 0 ? `,atempo=${1 / Math.lerp(1, speed, a)}` : ''}[ga${i + 1}]`,
                        pts: i == (n - 1) ? speed : `if(lt(T/${duration},${a3}),${Math.lerp(1, speed, a)},{next})`
                    })
                }

                for (var i in gradual) {
                    var grad = gradual[i]
                    ptsvalue = ptsvalue.replace('{next}', grad.pts)
                }

                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]setpts='lerp(1,${speed},T/${duration})*PTS'[v];${gradual.map(g => g.filter).join(';')};${gradual.map(g => g.audio).join('')}concat=n=${n}:a=1:v=0,atempo[a]" -map "[v]" -map "[a]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/gradual.mp4`)
                var gradualinfo = await validateFileFromPath(`${filepath}/gradual.mp4`, 'very true').catch(() => { })
                if (!gradualinfo) {
                    await msg.reply('Error while processing initial effect.').catch(() => { })
                    await msg.channel.sendTyping().catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                    return
                }
                var gduration = gradualinfo.info.duration
                var gaduration = gradualinfo.info.aduration
                await execPromise(`ffmpeg -i ${filepath}/gradual.mp4 -filter_complex "[0:v]setpts=PTS/(${Number(gduration)}/${Number(gaduration)})/${ratio}[v]" -map "[v]" -map 0:a -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            } else {
                var fps = fileinfo.info.fps
                var duration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)

                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]setpts='lerp(1,${speed},T/${duration})*PTS'[v]" -map "[v]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            }
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            var duration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)

            var f = duration / n

            for (var i = 0; i < n; i++) {
                var a = i / (n - 1)
                var a2 = i / n
                var start = duration * a2
                var end = start + f
                gradual.push({
                    audio: `[ga${i + 1}]`,
                    filter: `[0:a]atrim=${start}:${end}${i != 0 ? `,atempo=${1 / Math.lerp(1, speed, a)}` : ''}[ga${i + 1}]`
                })
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "${gradual.map(g => g.filter).join(';')};${gradual.map(g => g.audio).join('')}concat=n=${n}:a=1:v=0,atempo[a]" -map "[a]" -preset ${findpreset(args)} ${filepath}/output.mp3`)
            return await sendFile(msg, filepath, `output.mp3`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var fps = fileinfo.info.fps
            var duration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]setpts='(1/lerp(1,${speed},T/${duration}))*PTS',split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'gradualslowdown/gradualslow [multiplier <number (from 1 to 2)>] {file}',
        value: 'Gradually slows down the file until the end.'
    },
    cooldown: 2500,
    type: 'Duration'
}