module.exports = {
    name: ['mixaudio', 'mixsound', 'mixmusic'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"audio","required":false,"specifarg":false,"orig":"{audio}"},{"name":"offset","required":false,"specifarg":true,"orig":"[-offset <seconds (you can use hh:mm:ss)>]"},{"name":"waituntilend","required":false,"specifarg":true,"orig":"[-waituntilend]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, getUrls, validateFile, downloadFile, fetchPingPerms,
            execPromise, findpreset, sendFile
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 1) === undefined && args[2] === undefined) {
            await msg.reply('What are the files?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
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
            if (!(type.mime.startsWith('image') || type.mime.startsWith('video') || type.mime.startsWith('audio'))) {
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

        if (audio2) {
            duration = Number(duration)
            duration2 = Number(duration2)

            var offset = 0
            var offsetindex = args.indexOf('-offset')
            if (offsetindex > -1) {
                var offsetstamp = args[offsetindex + 1]
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
            }

            await execPromise(
                filetype.mime.startsWith('image') ?
                `ffmpeg -stream_loop -1 -i ${filepath}/${filename} -itsoffset ${offset} -i ${filepath}/${filename2} -filter_complex "[0:v]scale=ceil(iw/2)*2:ceil(ih/2)*2[v]" -map "[v]" -map 1:a -preset ${findpreset(args)} -c:v libx264 -tune stillimage -c:a aac -pix_fmt yuv420p -shortest -t ${duration2 + offset} ${filepath}/output.mp4` : !audio ? `ffmpeg -i ${filepath}/${filename} -itsoffset ${offset} -i ${filepath}/${filename2} -filter_complex "[0:v]scale=ceil(iw/2)*2:ceil(ih/2)*2[v]" -map "[v]" -map 1:a -c:v libx264 -tune stillimage -c:a aac -pix_fmt yuv420p -shortest -t ${duration} ${filepath}/output.mp4` :
                `ffmpeg -i ${filepath}/${filename} -i ${filepath}/${filename2} ${offset > 0 ? `-f lavfi -t ${offset} -i anullsrc=r=48000 ` : ''}-filter_complex "${offset > 0 ? `[1:a]aresample=44100[silaud];[2:a][silaud]concat=a=1:v=0[aud];` : ''}[0:a][${offset > 0 ? 'aud' : '1:a'}]amix=inputs=2:duration=longest[a]" ${!(filetype.mime.startsWith('audio')) ? '-map 0:v ' : ''}-map "[a]" -preset ${findpreset(args)} ${!(filetype.mime.startsWith('audio')) ? '-c:v libx264 -pix_fmt yuv420p ' : ''} -shortest -t ${(duration2 + offset <= duration) && !(args.find(arg => arg === '-waituntilend')) ? duration2 + offset : duration} ${filepath}/output.${!(filetype.mime.startsWith('audio')) ? 'mp4' : 'mp3'}`
            )
            return await sendFile(msg, filepath, `output.${!(filetype.mime.startsWith('audio')) ? 'mp4' : 'mp3'}`)
        } else {
            await msg.reply('No audio stream detected.').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            fs.rmSync(`${filepath}`, { force: true, recursive: true })
        }
    },
    help: {
        name: 'mixaudio/mixsound/mixmusic {file} {audio} [-offset <seconds (you can use hh:mm:ss)>] [-waituntilend]',
        value: "Mixes the first file's audio with the second file's audio."
    },
    cooldown: 2500,
    type: 'Audio'
}