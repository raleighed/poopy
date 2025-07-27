module.exports = {
    name: ['desktopdestroy', 'desktopdestroyer'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

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

        if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -stream_loop -1 -i ${filepath}/${filename} -i assets/image/destroy.gif -filter_complex "${height >= 238 ? `[1:v]scale=-1:${height >= 300 ? 300 : height}[ckout];` : ''}[${height >= 238 ? `ckout` : `1:v`}]colorkey=0x00FF01:0.3:0.3[jout];[0:v]scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease[lout];[lout][jout]overlay=shortest=1:x=W/2-w/2:y=H/2-h/2:format=auto[rout];[rout]split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i ${filepath}/${filename} -stream_loop -1 -i assets/image/destroy.gif -map 0:a? -filter_complex "${height >= 238 ? `[1:v]scale=-1:${height}[ckout];` : ''}[${height >= 238 ? `ckout` : `1:v`}]colorkey=0x00FF01:0.3:0.3[jout];[0:v][jout]overlay=shortest=1:x=W/2-w/2:y=H/2-h/2:format=auto[sout];[sout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -stream_loop -1 -i ${filepath}/${filename} -i assets/image/destroy.gif -filter_complex "${height >= 238 ? `[1:v]scale=-1:${height}[ckout];` : ''}[${height >= 238 ? `ckout` : `1:v`}]colorkey=0x00FF01:0.3:0.3[jout];[0:v][jout]overlay=shortest=1:x=W/2-w/2:y=H/2-h/2:format=auto[rout];[rout]split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
    help: { name: 'desktopdestroy/desktopdestroyer {file}', value: 'death' },
    cooldown: 2500,
    type: 'Memes'
}