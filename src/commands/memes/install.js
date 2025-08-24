module.exports = {
    name: ['install', 'installnow'],
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
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/install.png -i assets/image/transparent.png -filter_complex "[1:v]scale=${width}:-1[install];[2:v][install]scale=h=rh+${height}[transparent];[transparent][0:v]overlay=x=0:y=0:format=auto[fout];[fout][install]overlay=x=0:y=${height}:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i assets/image/install.png -filter_complex "[0:v]scale=${width}:-1[install]" -map "[install]" ${filepath}/install.png`)
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filepath}/install.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/install.png -i assets/image/transparent.png -map 0:a? -filter_complex "[2:v][1:v]scale=h=rh+${height}[transparent];[transparent][0:v]overlay=x=0:y=0:format=auto[fout];[fout][1:v]overlay=x=0:y=${height}:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${width}:${height + bheight} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i assets/image/install.png -filter_complex "[0:v]scale=${width}:-1[install]" -map "[install]" ${filepath}/install.png`)
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filepath}/install.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/install.png -i assets/image/transparent.png -filter_complex "[2:v][1:v]scale=h=rh+${height}[transparent];[transparent][0:v]overlay=x=0:y=0:format=auto[fout];[fout][1:v]overlay=x=0:y=${height}:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${width}:${height + bheight} -gifflags -offsetting ${filepath}/output.gif`)
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
    help: { name: 'install/installnow {file}', value: 'Install Now' },
    cooldown: 2500,
    type: 'Memes'
}