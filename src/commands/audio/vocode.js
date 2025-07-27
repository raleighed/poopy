module.exports = {
    name: ['vocode', 'autotune'],
    args: [{"name":"carrier","required":false,"specifarg":false,"orig":"{carrier}"},{"name":"modulator","required":false,"specifarg":false,"orig":"{modulator}"},{"name":"bandcount","required":false,"specifarg":true,"orig":"[-bandcount <value (max 512)>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            getOption, parseNumber, lastUrl, getUrls, fetchPingPerms,
            validateFile, downloadFile, execPromise, findpreset, sendFile
        } = poopy.functions
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 1) === undefined && args[2] === undefined) {
            await msg.reply('What are the files?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };

        var bandcount = getOption(args, 'bandcount', { dft: 75, func: (opt) => parseNumber(opt, { min: 1, max: 512, round: true, dft: 75 }) })

        var currenturl = lastUrl(msg, 0) || args[1]
        var currenturl2 = lastUrl(msg, 1) || args[2]
        var urls = await getUrls(msg).catch(() => { }) ?? []
        if (urls.length < 2) {
            var c = currenturl
            currenturl = currenturl2
            currenturl2 = c
        }
        var errors = {}
        var fileinfo = await validateFile(currenturl, false, {
            size: `the first file exceeds the size limit of {param} mb hahahaha (try to use the shrink, setfps, trim or crunch commands)`,
            frames: `the frames of the first file exceed the limit of {param} hahahaha (try to use the setfps or the trim commands)`,
            width: `the width of the first file exceeds the limit of {param} hahahaha (try to use the shrink command)`,
            height: `the height of the first file exceeds the limit of {param} hahahaha (try to use the shrink command)`
        }).catch(async error => {
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
        var filetype = fileinfo.type
        var fileinfo2 = await validateFile(currenturl2, true, {
            size: `the second file exceeds the exception size limit of {param} mb hahahaha there's nothing you can do`,
            frames: `the frames of the second file exceed the exception limit of {param} hahahaha there's nothing you can do`,
            width: `the width of the second file exceeds the exception limit of {param} hahahaha there's nothing you can do`,
            height: `the height of the second file exceeds the exception limit of {param} hahahaha there's nothing you can do`
        }).catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        })
        if (!fileinfo2) return
        var filetype2 = fileinfo2.type
        var filetypes = [filetype, filetype2]
        for (var i in errors) {
            var error = errors[i]
            if (error) {
                await msg.reply({
                    content: error,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                return
            }
        }
        for (var i in filetypes) {
            var type = filetypes[i]
            if (!(type.mime.startsWith('video') || type.mime.startsWith('audio'))) {
                await msg.reply({
                    content: 'Unsupported file types.',
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                return
            }
        }
        var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
            fileinfo        })
        var filename = `input.${fileinfo.shortext}`
        await downloadFile(currenturl2, `input2.${fileinfo2.shortext}`, {
            fileinfo: fileinfo2,
            filepath: filepath
        })
        var filename2 = `input2.${fileinfo2.shortext}`

        var duration = fileinfo.info.duration
        var duration2 = fileinfo2.info.duration
        var audio = fileinfo.info.audio
        var audio2 = fileinfo2.info.audio

        if (audio && audio2) {
            duration = Number(duration)
            duration2 = Number(duration2)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -vn -ac 1 -ar 44100 -preset ${findpreset(args)} ${filepath}/carrier.wav`)
            await execPromise(`ffmpeg -i ${filepath}/${filename2} -vn -ac 1 -ar 44100 -preset ${findpreset(args)} ${filepath}/modulator.wav`)
            await execPromise(`vocoder -b ${bandcount} ${filepath}/carrier.wav ${filepath}/modulator.wav ${filepath}/output.wav`)

            if (filetype.mime.startsWith('audio')) return await sendFile(msg, filepath, `output.wav`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/output.wav -map 0:v -map 1:a -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p -shortest -t ${duration} ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else {
            await msg.reply('No audio stream detected.').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            fs.rmSync(`${filepath}`, { force: true, recursive: true })
        }
    },
    help: {
        name: 'vocode/autotune {carrier} {modulator} [-bandcount <value (max 512)>]',
        value: "Synthesizes the carrier's sound with the modulator. Default bandcount is 75."
    },
    cooldown: 2500,
    type: 'Audio'
}