module.exports = {
    name: ['battlecats', 'bc'],
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
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 assets/image/battlecats.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=${height > (bheight / 1.1) ? -1 : 'iw'}:${height > (bheight / 1.1) ? bheight / 1.3 : 'ih'}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/scaled.png`)
            var scale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filepath}/scaled.png`)
            scale = scale.replace(/\n|\r/g, '').split('x')
            height = Number(scale[1])

            await execPromise(`ffmpeg -i ${filepath}/scaled.png -i assets/image/battlecats.png -i assets/image/shadow.png -filter_complex "[2:v]scale=${width + 15}:10[shadow];[1:v][shadow]overlay=x=W/2-w/2:y=H/1.1-h/2:format=auto[bshadow];[bshadow][0:v]overlay=x=W/2-w/2:y=H/1.1-h:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 assets/image/battlecats.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]scale=${height > (bheight / 1.1) ? -1 : 'iw'}:${height > (bheight / 1.1) ? bheight / 1.3 : 'ih'}[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/scaled.mp4`)
            var scale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filepath}/scaled.mp4`)
            scale = scale.replace(/\n|\r/g, '').split('x')
            height = Number(scale[1])

            await execPromise(`ffmpeg -i ${filepath}/scaled.mp4 -i assets/image/battlecats.png -i assets/image/shadow.png -map 0:a? -filter_complex "[2:v]scale=${width + 15}:10[shadow];[1:v][shadow]overlay=x=W/2-w/2:y=H/1.1-h/2:format=auto[bshadow];[bshadow][0:v]overlay=x=W/2-w/2:y=H/1.1-h:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 assets/image/battlecats.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=${height > (bheight / 1.1) ? -1 : 'iw'}:${height > (bheight / 1.1) ? bheight / 1.3 : 'ih'}[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/scaled.gif`)
            var scale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filepath}/scaled.gif`)
            scale = scale.replace(/\n|\r/g, '').split('x')
            height = Number(scale[1])

            await execPromise(`ffmpeg -i ${filepath}/scaled.gif -i assets/image/battlecats.png -i assets/image/shadow.png -filter_complex "[2:v]scale=${width + 15}:10[shadow];[1:v][shadow]overlay=x=W/2-w/2:y=H/1.1-h/2:format=auto[bshadow];[bshadow][0:v]overlay=x=W/2-w/2:y=H/1.1-h:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'battlecats/bc {file}',
        value: 'Command your Cats with simple controls in a battle through space and time! No need to register to develop your own Cat Army! BATTLE WITH ALL THE CATS!!'
    },
    cooldown: 2500,
    type: 'Memes'
}