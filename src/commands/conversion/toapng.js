module.exports = {
    name: ['toapng'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"duration","required":false,"specifarg":true,"orig":"[-duration <seconds (max 60)>]"},{"name":"fps","required":false,"specifarg":true,"orig":"[-fps <fps (max 50)>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var duration = 10
        var durationindex = args.indexOf('-duration')
        if (durationindex > -1) {
            duration = isNaN(Number(args[durationindex + 1])) ? 10 : Number(args[durationindex + 1]) <= 0.05 ? 0.05 : Number(args[durationindex + 1]) >= 60 ? 60 : Number(args[durationindex + 1]) || 10
        }
        var fps = 50
        var fpsindex = args.indexOf('-fps')
        if (fpsindex > -1) {
            fps = isNaN(Number(args[fpsindex + 1])) ? 20 : Number(args[fpsindex + 1]) <= 0.1 ? 0.1 : Number(args[fpsindex + 1]) >= 50 ? 50 : Number(args[fpsindex + 1]) || 20
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease[out]" -map "[out]" -preset ${findpreset(args)} -plays 0 -t ${duration >= iduration ? iduration : duration} -r ${fps} ${filepath}/output.apng`)
            try {
                fs.renameSync(`${filepath}/output.apng`, `${filepath}/output.png`)
            } catch (_) {
                await msg.reply('Couldn\'t send file.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('image') && type.ext === 'gif') {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0' : fileinfo.info.duration)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -plays 0 -t ${duration >= iduration ? iduration : duration} -r ${fps} -preset ${findpreset(args)} ${filepath}/output.apng`)
            try {
                fs.renameSync(`${filepath}/output.apng`, `${filepath}/output.png`)
            } catch (_) {
                await msg.reply('Couldn\'t send file.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }
            return await sendFile(msg, filepath, `output.png`)
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
        name: 'toapng {file} [-duration <seconds (max 60)>] [-fps <fps (max 50)>]',
        value: 'Converts the video/GIF to APNG. Default duration is 10 and default FPS is 20.'
    },
    cooldown: 2500,
    type: 'Conversion'
}