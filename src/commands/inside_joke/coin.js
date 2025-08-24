module.exports = {
    name: ['coin'],
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/coinmask.png -i assets/image/shadow.png -filter_complex "${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=256:256[frame];[2:v]scale=256:256[shadow];[1:v]scale=256:256[mask];[frame][mask]alphamerge[mframe];[shadow][mframe]overlay=x=0:y=0:format=auto,convolution='-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2'[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/coinmaskv.png -i assets/image/shadow.png -map 0:a? -filter_complex "${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=256:256[frame];[2:v]scale=256:256[shadow];[1:v]scale=256:256[mask];[frame][mask]overlay=x=0:y=0:format=auto[mframe];[shadow][mframe]overlay=x=0:y=0:format=auto,convolution='-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2'[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/coinmaskg.png -i assets/image/shadow.png -filter_complex "${squareS.constraint !== 'both' ? `[0:v]crop=x=${squareS.constraint === 'height' ? 0 : 'iw/2-ih/2'}:y=${squareS.constraint === 'width' ? 0 : 'ih/2-iw/2'}:w=${squareS.constraint === 'width' ? 'ih' : 'iw'}:h=${squareS.constraint === 'height' ? 'iw' : 'ih'}[cframe];` : ''}[${squareS.constraint !== 'both' ? 'cframe' : '0:v'}]scale=256:256[frame];[2:v]scale=256:256[shadow];[1:v]scale=256:256[mask];[frame][mask]overlay=x=0:y=0:format=auto[mframe];[shadow][mframe]overlay=x=0:y=0:format=auto,colorkey=0x00AC91:0.01:0,convolution='-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2'[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
    help: { name: 'coin {file}', value: 'Make your own currency!' },
    cooldown: 2500,
    type: 'Inside Joke'
}