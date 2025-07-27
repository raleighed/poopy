module.exports = {
    name: ['autotrim', 'autocut'],
    args: [{ "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, { "name": "threshold", "required": false, "specifarg": true, "orig": "[-threshold <percentage>]" }, { "name": "silenceduration", "required": false, "specifarg": true, "orig": "[-silenceduration <seconds (from 0.1 to 10)>]" }, { "name": "trimmiddle", "required": false, "specifarg": true, "orig": "[-trimmiddle]" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, getOption, parseNumber, validateFile, fetchPingPerms,
            downloadFile, chunkArray, execPromise, findpreset, sendFile
        } = poopy.functions
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };

        var threshold = getOption(args, 'threshold', { dft: 0.01, func: (opt) => parseNumber(opt.replace('%', ''), { min: 0, max: 100, dft: 0.01 }) }) / 100
        var silenceduration = getOption(args, 'silenceduration', { dft: 2, func: (opt) => parseNumber(opt, { min: 0.1, max: 10, dft: 2 }) })
        var trimmiddle = getOption(args, 'trimmiddle', { dft: false, n: 0 })

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

            var duration = fileinfo.info.aduration

            if (audio) {
                var silencestd = await execPromise(`ffmpeg -i ${filepath}/${filename} -af silencedetect=${threshold}:${silenceduration} -f null -`)
                var silencedetect = (silencestd.match(/silence_end: [0-9.]+ \| silence_duration: [0-9.]+/g) ?? [])
                    .map(track => track.split(' | ').map(t => Number(t.match(/[0-9.]+/)[0])))

                if (silencedetect.length > 100 && trimmiddle) {
                    await msg.reply(`my brother in christ i'm not going to trim that video ${silencedetect.length} times`).catch(() => { })
                    await msg.channel.sendTyping().catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                    return
                }

                if (silencedetect.length == 1 && silencedetect[0][0] >= duration && silencedetect[0][1] >= duration) {
                    await msg.reply(`Everything is silent.`).catch(() => { })
                    await msg.channel.sendTyping().catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                    return
                }

                var trimtracks = []
                var st = silencedetect.find(track => track[0] - track[1] == 0)
                var en = silencedetect.find(track => track[0] >= duration)

                trimtracks.push(st ? st[0] : 0)
                if (trimmiddle) for (var i in silencedetect) {
                    if (st && i == 0 || en && i == silencedetect.length - 1) continue
                    var tr = silencedetect[i]
                    trimtracks.push(tr[0] - tr[1])
                    trimtracks.push(tr[0])
                }
                trimtracks.push(en ? en[0] - en[1] : duration)

                trimtracks = chunkArray(trimtracks, 2)

                var trimtemplates = []
                var atrimtemplates = []
                var trimconcat = []
                var atrimconcat = []

                for (var i in trimtracks) {
                    var track = trimtracks[i]
                    trimtemplates.push(`[0:v]trim=start=${track[0]}:end=${track[1]},setpts=PTS-STARTPTS[v${i}]`)
                    atrimtemplates.push(`[0:a]atrim=start=${track[0]}:end=${track[1]},asetpts=PTS-STARTPTS[a${i}]`)
                    trimconcat.push(`[v${i}]`)
                    atrimconcat.push(`[a${i}]`)
                }

                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "${trimtemplates.join(';')};${trimconcat.join('')}concat=v=1:a=0:n=${trimconcat.length},scale=ceil(iw/2)*2:ceil(ih/2)*2[v];${atrimtemplates.join(';')};${atrimconcat.join('')}concat=v=0:a=1:n=${atrimconcat.length}[a]" -map "[v]" -map "[a]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
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

            var duration = fileinfo.info.aduration

            var silencestd = await execPromise(`ffmpeg -i ${filepath}/${filename} -af silencedetect=${threshold}:${silenceduration} -f null -`)
            var silencedetect = (silencestd.match(/silence_end: [0-9.]+ \| silence_duration: [0-9.]+/g) ?? [])
                .map(track => track.split(' | ').map(t => Number(t.match(/[0-9.]+/)[0])))

            if (silencedetect.length > 150 && trimmiddle) {
                await msg.reply(`my brother in christ i'm not going to trim that audio ${silencedetect.length} times`).catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            if (silencedetect.length == 1 && silencedetect[0][0] >= duration && silencedetect[0][1] >= duration) {
                await msg.reply(`Everything is silent.`).catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            var trimtracks = []
            var st = silencedetect.find(track => track[0] - track[1] == 0)
            var en = silencedetect.find(track => track[0] >= duration)

            trimtracks.push(st ? st[0] : 0)
            if (trimmiddle) for (var i in silencedetect) {
                if (st && i == 0 || en && i == silencedetect.length - 1) continue
                var tr = silencedetect[i]
                trimtracks.push(tr[0] - tr[1])
                trimtracks.push(tr[0])
            }
            trimtracks.push(en ? en[0] - en[1] : duration)

            trimtracks = chunkArray(trimtracks, 2)

            var trimtemplates = []
            var trimconcat = []

            for (var i in trimtracks) {
                var track = trimtracks[i]
                trimtemplates.push(`[0:a]atrim=start=${track[0]}:end=${track[1]},asetpts=PTS-STARTPTS[a${i}]`)
                trimconcat.push(`[a${i}]`)
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "${trimtemplates.join(';')};${trimconcat.join('')}concat=v=0:a=1:n=${trimconcat.length}[a]" -map "[a]" -preset ${findpreset(args)} ${filepath}/output.mp3`)
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
        name: 'autotrim/autocut {file} [-threshold <percentage>] [-silenceduration <seconds (from 0.1 to 10)>] [-trimmiddle]',
        value: "Automatically trims the audio's silence."
    },
    cooldown: 2500,
    type: 'Duration'
}