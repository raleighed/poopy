module.exports = {
    name: ['echo'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"delay","required":false,"specifarg":true,"orig":"[-delay <seconds (max 90)>]"},{"name":"decay","required":false,"specifarg":true,"orig":"[-decay <loudness (from 0 to 100)>]"},{"name":"echoes","required":false,"specifarg":true,"orig":"[-echoes <number (from 1 to 99)>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, fetchPingPerms,
            execPromise, sendFile
        } = poopy.functions
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var delay = 1
        var delayindex = args.indexOf('-delay')
        if (delayindex > -1) {
            delay = isNaN(Number(args[delayindex + 1])) ? 1 : Number(args[delayindex + 1]) <= 0 ? 0 : Number(args[delayindex + 1]) >= 90 ? 90 : Number(args[delayindex + 1]) ?? 1
        }
        var decay = 50
        var decayindex = args.indexOf('-decay')
        if (decayindex > -1) {
            decay = isNaN(Number(args[decayindex + 1])) ? 50 : Number(args[decayindex + 1]) <= 0 ? 0 : Number(args[decayindex + 1]) >= 100 ? 100 : Number(args[decayindex + 1]) ?? 50
        }
        var echoes = 1
        var echoesindex = args.indexOf('-echoes')
        if (echoesindex > -1) {
            echoes = isNaN(Number(args[echoesindex + 1])) ? 1 : Number(args[echoesindex + 1]) <= 1 ? 1 : Number(args[echoesindex + 1]) >= 99 ? 99 : Number(args[echoesindex + 1]) || 1
        }
        var echocode = `aecho=1:1:${delay * 1000}:${decay / 100}`
        var echocodes = []
        for (var i = 0; i < echoes; i++) echocodes.push(echocode)
        var echoescode = echocodes.join(',')
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var audio = fileinfo.info.audio

            if (audio) {
                var duration = Number(fileinfo.info.duration)

                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:a]${echoescode}[audio];[0:v]scale=ceil(iw/2)*2:ceil(ih/2)*2[video]" -map "[video]" -map "[audio]" -t ${duration} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            } else {
                await msg.reply('No audio stream detected.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
            }
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:a]${echoescode}[audio]" -map "[audio]" ${filepath}/output.mp3`)
            return await sendFile(msg, filepath, `output.mp3`)
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
        name: 'echo {file} [-delay <seconds (max 90)>] [-decay <loudness (from 0 to 100)>] [-echoes <number (from 1 to 99)>]',
        value: 'Adds an echo effect to the video.'
    },
    cooldown: 2500,
    type: 'Audio'
}