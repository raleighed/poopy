module.exports = {
    name: ['loophole'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
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

        if (type.mime.startsWith('video') || (type.mime.startsWith('image'))) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -stream_loop -1 -t 1 -i ${filepath}/${filename} -stream_loop -1 -t 1 -i ${filepath}/${filename} -f lavfi -stream_loop -1 -t 1 -r 50 -i "color=0x00000000:s=${width}x${height},format=rgba" -filter_complex "[0:v]fps=50,scale=${width}*(t*4+1):${height}*(t*4+1):eval=frame[overlay];[1:v]fps=50,scale=${width}*t:${height}*t:eval=frame[overlay2];[2:v][overlay]overlay=x=(W-w)/2:y=(H-h)/2:format=auto[zoom];[zoom][overlay2]overlay=x=(W-w)/2:y=(H-h)/2:format=auto,scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -y -shortest -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'loophole {file}',
        value: 'Creates an infinite zooming in loophole with the file.'
    },
    cooldown: 2500,
    type: 'Animation'
}