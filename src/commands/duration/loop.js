module.exports = {
    name: ['loop', 'repeat'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"times","required":false,"specifarg":false,"orig":"[times]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let { fs } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]
        var numToRepeat = typeof (Number(args[2])) === 'number' && ((Number(args[2]) >= 10 && 10) || (Number(args[2]) < 2 && 2)) || typeof (Number(args[1])) === 'number' && ((Number(args[1]) >= 10 && 10) || (Number(args[1]) < 2 && 2)) || 2
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
            var list = ''
            for (var i = 0; i < numToRepeat; i++) {
                list = `${list}file '${filename}'\n`
            }
            fs.writeFileSync(`${filepath}/list.txt`, list)
            await execPromise(`ffmpeg -f concat -i ${filepath}/list.txt -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var list = ''
            for (var i = 0; i < numToRepeat; i++) {
                list = `${list}file '${filename}'\n`
            }
            fs.writeFileSync(`${filepath}/list.txt`, list)
            await execPromise(`ffmpeg -f concat -i ${filepath}/list.txt -preset ${findpreset(args)} -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            var list = ''
            for (var i = 0; i < numToRepeat; i++) {
                list = `${list}file '${filename}'\n`
            }
            fs.writeFileSync(`${filepath}/list.txt`, list)
            await execPromise(`ffmpeg -f concat -i ${filepath}/list.txt -preset ${findpreset(args)} ${filepath}/output.mp3`)
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
        name: 'loop/repeat {file} [times]',
        value: "Loops the file, if [times] is supplied, it'll loop [times] times.\n" +
            'Example usage: p:loop https://cdn.discordapp.com/attachments/621060031357517827/823936228323623023/video.mp4 3'
    },
    cooldown: 2500,
    type: 'Duration'
}