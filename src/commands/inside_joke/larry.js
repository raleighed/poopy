module.exports = {
    name: ['larry'],
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
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/larry.png -i assets/image/white.png -i assets/image/transparent.png -filter_complex "[0:v]scale=57:39[frame];[2:v]scale=57:39[white];[3:v][1:v]scale2ref[transparent][larry];[white][frame]overlay=x=0:y=0:format=auto[wframe];[transparent][wframe]overlay=x=187:y=57:format=auto[twframe];[twframe][larry]overlay=x=0:y=0:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/larry.png -i assets/image/white.png -i assets/image/transparent.png -map 0:a? -filter_complex "[0:v]scale=57:39[frame];[2:v]scale=57:39[white];[3:v][1:v]scale2ref[transparent][larry];[white][frame]overlay=x=0:y=0:format=auto[wframe];[transparent][wframe]overlay=x=187:y=57:format=auto[twframe];[twframe][larry]overlay=x=0:y=0:format=auto[oout];[oout]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/larry.png -i assets/image/white.png -i assets/image/transparent.png -filter_complex "[0:v]scale=57:39[frame];[2:v]scale=57:39[white];[3:v][1:v]scale2ref[transparent][larry];[white][frame]overlay=x=0:y=0:format=auto[wframe];[transparent][wframe]overlay=x=187:y=57:format=auto[twframe];[twframe][larry]overlay=x=0:y=0:format=auto[oout];[oout]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'larry {file}',
        value: 'Step 1: Eat hot chip\nStep 2: Eat hot chip\nStep 3: Eat hot chip'
    },
    cooldown: 2500,
    type: 'Inside Joke'
}