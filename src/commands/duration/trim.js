module.exports = {
    name: ['trim', 'cut'],
    args: [{"name":"start","required":false,"specifarg":true,"orig":"[-start <timestamp (you can use hh:mm:ss)>]"},{"name":"end","required":false,"specifarg":true,"orig":"[-end <timestamp (you can use hh:mm:ss)>]"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, fetchPingPerms,
            execPromise, findpreset, sendFile, randomNumber
        } = poopy.functions
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        if (!args.includes('-start') && !args.includes('-end')) {
            await msg.reply(`Specify \`-start\` or \`-end\`! (Example: p:trim -start ${randomNumber(1, 10)/10} -end ${randomNumber(11, 20)/10})`).catch(() => { })
            return
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

            var start = 0
            var startindex = args.indexOf('-start')
            if (startindex > -1) {
                var startstamp = args[startindex + 1]
                if (startstamp !== undefined) {
                    var total = 0
                    startstamp = startstamp.split(':').reverse()
                    startstamp.splice(3)
                    for (var i = 0; i < startstamp.length; i++) {
                        startstamp[i] = isNaN(Number(startstamp[i])) ? 0 : Number(startstamp[i]) <= 0 ? 0 : Number(startstamp[i]) * (Math.pow(60, i)) || 0
                        total += startstamp[i]
                    }
                    start = total >= duration ? duration : total
                }
            }
            var end = duration
            var endindex = args.indexOf('-end')
            if (endindex > -1) {
                var endstamp = args[endindex + 1]
                if (endstamp !== undefined) {
                    var total = 0
                    endstamp = endstamp.split(':').reverse()
                    endstamp.splice(3)
                    for (var i = 0; i < endstamp.length; i++) {
                        endstamp[i] = isNaN(Number(endstamp[i])) ? 0 : Number(endstamp[i]) <= 0 ? 0 : Number(endstamp[i]) * (Math.pow(60, i)) || 0
                        total += endstamp[i]
                    }
                    end = total >= duration ? duration : total
                }
            }
            if (end <= start) {
                end = start
            }

            await execPromise(`ffmpeg -ss ${start} -t ${end - start} -i ${filepath}/${filename} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            var duration = Number(fileinfo.info.duration)

            var start = 0
            var startindex = args.indexOf('-start')
            if (startindex > -1) {
                var startstamp = args[startindex + 1]
                if (startstamp !== undefined) {
                    var total = 0
                    startstamp = startstamp.split(':').reverse()
                    startstamp.splice(3)
                    for (var i = 0; i < startstamp.length; i++) {
                        startstamp[i] = isNaN(Number(startstamp[i])) ? 0 : Number(startstamp[i]) <= 0 ? 0 : Number(startstamp[i]) * (Math.pow(60, i)) || 0
                        total += startstamp[i]
                    }
                    start = total >= duration ? duration : total
                }
            }
            var end = duration
            var endindex = args.indexOf('-end')
            if (endindex > -1) {
                var endstamp = args[endindex + 1]
                if (endstamp !== undefined) {
                    var total = 0
                    endstamp = endstamp.split(':').reverse()
                    endstamp.splice(3)
                    for (var i = 0; i < endstamp.length; i++) {
                        endstamp[i] = isNaN(Number(endstamp[i])) ? 0 : Number(endstamp[i]) <= 0 ? 0 : Number(endstamp[i]) * (Math.pow(60, i)) || 0
                        total += endstamp[i]
                    }
                    end = total >= duration ? duration : total
                }
            }
            if (end <= start) {
                end = start
            }

            await execPromise(`ffmpeg -ss ${start} -t ${end - start} -i ${filepath}/${filename} -preset ${findpreset(args)} ${filepath}/output.mp3`)
            return await sendFile(msg, filepath, `output.mp3`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var duration = Number(fileinfo.info.duration)

            var start = 0
            var startindex = args.indexOf('-start')
            if (startindex > -1) {
                var startstamp = args[startindex + 1]
                if (startstamp !== undefined) {
                    var total = 0
                    startstamp = startstamp.split(':').reverse()
                    startstamp.splice(3)
                    for (var i = 0; i < startstamp.length; i++) {
                        startstamp[i] = isNaN(Number(startstamp[i])) ? 0 : Number(startstamp[i]) <= 0 ? 0 : Number(startstamp[i]) * (Math.pow(60, i)) || 0
                        total += startstamp[i]
                    }
                    start = total >= duration ? duration : total
                }
            }
            var end = duration
            var endindex = args.indexOf('-end')
            if (endindex > -1) {
                var endstamp = args[endindex + 1]
                if (endstamp !== undefined) {
                    var total = 0
                    endstamp = endstamp.split(':').reverse()
                    endstamp.splice(3)
                    for (var i = 0; i < endstamp.length; i++) {
                        endstamp[i] = isNaN(Number(endstamp[i])) ? 0 : Number(endstamp[i]) <= 0 ? 0 : Number(endstamp[i]) * (Math.pow(60, i)) || 0
                        total += endstamp[i]
                    }
                    end = total >= duration ? duration : total
                }
            }
            if (end <= start) {
                end = start
            }

            await execPromise(`ffmpeg -ss ${start} -t ${end - start} -i ${filepath}/${filename} -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'trim/cut [-start <timestamp (you can use hh:mm:ss)>] [-end <timestamp (you can use hh:mm:ss)>] {file}',
        value: 'Trims the file from the start timestamp and the end timestamp.'
    },
    cooldown: 2500,
    type: 'Duration'
}