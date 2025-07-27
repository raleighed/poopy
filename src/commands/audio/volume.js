module.exports = {
    name: ['volume'],
    args: [{"name":"volume","required":false,"specifarg":false,"orig":"{volume (by percentage)}"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile,
            fetchPingPerms, execPromise, sendFile
        } = poopy.functions
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var volume = isNaN(Number(args[1])) ? 100 : Number(args[1]) || 0
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
                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter:a "volume=${volume / 100}" -filter:v "scale=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
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
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter:a "volume=${volume / 100}" ${filepath}/output.mp3`)
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
        name: 'volume {volume (by percentage)} {file}',
        value: "Increases the file's volume by {volume}%."
    },
    cooldown: 2500,
    type: 'Audio'
}