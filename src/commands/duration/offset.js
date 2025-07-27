module.exports = {
    name: ['offset'],
    args: [{"name":"timestamp","required":true,"specifarg":false,"orig":"<timestamp (you can use hh:mm:ss)>"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
        if (args[1] === undefined) {
            await msg.reply('What is the offset?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
        var currenturl = lastUrl(msg, 0)
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
            var duration = Number(fileinfo.info.duration)
            var audio = fileinfo.info.audio

            var offset = 0
            var offsetstamp = args[1]
            if (offsetstamp !== undefined) {
                var total = 0
                offsetstamp = offsetstamp.split(':').reverse()
                offsetstamp.splice(3)
                for (var i = 0; i < offsetstamp.length; i++) {
                    offsetstamp[i] = isNaN(Number(offsetstamp[i])) ? 0 : Number(offsetstamp[i]) <= 0 ? 0 : Number(offsetstamp[i]) * (Math.pow(60, i)) || 0
                    total += offsetstamp[i]
                }
                offset = total >= duration ? duration : total
            }

            await execPromise(`ffmpeg -ss ${offset} -i ${filepath}/${filename} -t ${offset} -i ${filepath}/${filename} -filter_complex "[0:v][1:v]concat,scale=ceil(iw/2)*2:ceil(ih/2)*2[v]${audio ? `;[0:a][1:a]concat=a=1:v=0[a]` : ''}" -map "[v]" ${audio ? `-map "[a]" ` : ''}-preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            var duration = Number(fileinfo.info.duration)

            var offset = 0
            var offsetstamp = args[1]
            if (offsetstamp !== undefined) {
                var total = 0
                offsetstamp = offsetstamp.split(':').reverse()
                offsetstamp.splice(3)
                for (var i = 0; i < offsetstamp.length; i++) {
                    offsetstamp[i] = isNaN(Number(offsetstamp[i])) ? 0 : Number(offsetstamp[i]) <= 0 ? 0 : Number(offsetstamp[i]) * (Math.pow(60, i)) || 0
                    total += offsetstamp[i]
                }
                offset = total >= duration ? duration : total
            }

            await execPromise(`ffmpeg -ss ${offset} -i ${filepath}/${filename} -t ${offset} -i ${filepath}/${filename} -filter_complex "[0:a][1:a]concat=a=1:v=0[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.mp3`)
            return await sendFile(msg, filepath, `output.mp3`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var duration = Number(fileinfo.info.duration)

            var offset = 0
            var offsetstamp = args[1]
            if (offsetstamp !== undefined) {
                var total = 0
                offsetstamp = offsetstamp.split(':').reverse()
                offsetstamp.splice(3)
                for (var i = 0; i < offsetstamp.length; i++) {
                    offsetstamp[i] = isNaN(Number(offsetstamp[i])) ? 0 : Number(offsetstamp[i]) <= 0 ? 0 : Number(offsetstamp[i]) * (Math.pow(60, i)) || 0
                    total += offsetstamp[i]
                }
                offset = total >= duration ? duration : total
            }

            await execPromise(`ffmpeg -ss ${offset} -i ${filepath}/${filename} -t ${offset} -i ${filepath}/${filename} -filter_complex "[0:v][1:v]concat,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'offset <timestamp (you can use hh:mm:ss)> {file}',
        value: 'Offsets the file by the timestamp.'
    },
    cooldown: 2500,
    type: 'Duration'
}