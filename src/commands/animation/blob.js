module.exports = {
    name: ['blob', 'slime', 'squishy2'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"duration","required":false,"specifarg":true,"orig":"[-duration <seconds (max 10)>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var duration = 0.5
        var durationindex = args.indexOf('-duration')
        if (durationindex > -1) {
            duration = isNaN(Number(args[durationindex + 1])) ? 0.5 : Number(args[durationindex + 1]) <= 0.05 ? 0.05 : Number(args[durationindex + 1]) >= 10 ? 10 : Number(args[durationindex + 1]) || 0.5
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

        if (type.mime.startsWith('image')) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            await execPromise(`ffmpeg -stream_loop -1 -t ${duration} -i ${filepath}/${filename} -r 50 -stream_loop -1 -t ${duration} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=w=rw+rw/10:h=rh[transparent];[0:v]fps=50,scale=iw+sin(PI/2*(t*4/${duration}))*(iw/10):ih+cos(PI/2*(t*4/${duration}))*(ih/3)-ih/3:eval=frame[ooverlay];[transparent][ooverlay]overlay=x=(W-w)/2:y=(H-h):format=auto,scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -aspect ${Math.floor(width + width / 10)}:${height} -preset ${findpreset(args)} -gifflags -offsetting -r 50 -t ${duration} ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var fps = fileinfo.info.fps
            await execPromise(`ffmpeg -r ${fps.includes('0/0') ? '50' : fps} -i ${filepath}/${filename} -r ${fps.includes('0/0') ? '50' : fps} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=w=rw+rw/10:h=rh[transparent];[0:v]scale=iw+sin(PI/2*(t*4/${duration}))*(iw/10):ih+cos(PI/2*(t*4/${duration}))*(ih/3)-ih/3:eval=frame[ooverlay];[transparent][ooverlay]overlay=x=(W-w)/2:y=(H-h):format=auto[out]" -map "[out]" -map 0:a? -c:v libx264 -pix_fmt yuv420p -aspect ${Math.floor(width + width / 10)}:${height} -preset ${findpreset(args)} ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
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
        name: 'blob/slime/squishy2 {file} [-duration <seconds (max 10)>]',
        value: 'Makes the file squishy like a blob.'
    },
    cooldown: 2500,
    type: 'Animation'
}