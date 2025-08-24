module.exports = {
    name: ['crewmate', 'amongus', 'amogus'],
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
            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/crewmate.png -i assets/image/crewmatemask.png -i assets/image/black.png -filter_complex "[3:v][1:v]scale=rw:rh[black];[0:v]scale=${squareS.constraint === 'width' ? -1 : 86}:${squareS.constraint === 'height' ? -1 : 86}[frame];[black][frame]overlay=x=136.5-w/2:y=78-h/2:format=auto[tframe];[tframe][1:v]overlay=x=0:y=0:format=auto[cout];[cout][2:v]alphamerge[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 assets/image/crewmate.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bwidth = Number(bscale[0])
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/crewmate.png -i assets/image/crewmatemaskv.png -i assets/image/black.png -map 0:a? -filter_complex "[3:v][1:v]scale=rw:rh[black];[0:v]scale=${squareS.constraint === 'width' ? -1 : 86}:${squareS.constraint === 'height' ? -1 : 86}[frame];[black][frame]overlay=x=136.5-w/2:y=78-h/2:format=auto[tframe];[tframe][1:v]overlay=x=0:y=0:format=auto[cout];[cout][2:v]overlay=x=0:y=0:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${bwidth}:${bheight} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }
            var bscale = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 assets/image/crewmate.png`)
            bscale = bscale.replace(/\n|\r/g, '').split('x')
            var bwidth = Number(bscale[0])
            var bheight = Number(bscale[1])

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/crewmate.png -i assets/image/crewmatemaskg.png -i assets/image/black.png -filter_complex "[3:v][1:v]scale=rw:rh[black];[0:v]scale=${squareS.constraint === 'width' ? -1 : 86}:${squareS.constraint === 'height' ? -1 : 86}[frame];[black][frame]overlay=x=136.5-w/2:y=78-h/2:format=auto[tframe];[tframe][1:v]overlay=x=0:y=0:format=auto[cout];[cout][2:v]overlay=x=0:y=0:format=auto,colorkey=0x00AC91:0.01:0[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${bwidth}:${bheight} -gifflags -offsetting ${filepath}/output.gif`)
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
    help: { name: 'crewmate/amongus/amogus {file}', value: 'HOP ON AMONG US!' },
    cooldown: 2500,
    type: 'Memes'
}