module.exports = {
    name: ['hankjump', 'hank'],
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

        if (type.mime.startsWith('image') || type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            await execPromise(`ffmpeg -r 50 -stream_loop -1 -t 0.35 -i ${filepath}/${filename} -r 50 -stream_loop -1 -t 0.35 -i assets/image/transparent.png -filter_complex "[0:v]scale=100:100:force_original_aspect_ratio=decrease,split=3[overlay][overlay2][overlay3];[1:v]scale=300:300,split=3[transparent][transparent2][transparent3];[overlay]rotate=sin(PI/2*(t*5.6))*10*PI/180:ow=rotw(45):oh=roth(45):c=0x00000000[roverlay];[overlay2]rotate=sin(PI/2*(t*5.6))*-10*PI/180:ow=rotw(45):oh=roth(45):c=0x00000000[roverlay2];[overlay3]rotate=t*2.8*360*PI/180:ow=rotw(45):oh=roth(45):c=0x00000000[roverlay3];[transparent][roverlay]overlay=x=((W-w)/2)+sin(PI/2*(t*5.6))*5:y=(((H-h)/2)-sin(PI/2*(t*5.6))*100)+100:format=auto,split=5[jump1_1][jump1_2][jump1_3][jump1_4][jump1_5];[transparent2][roverlay2]overlay=x=((W-w)/2)+sin(PI/2*(t*5.6))*5:y=(((H-h)/2)-sin(PI/2*(t*5.6))*100)+100:format=auto,split=4[jump2_1][jump2_2][jump2_3][jump2_4];[transparent3][roverlay3]overlay=x=((W-w)/2)+sin(PI/2*(t*5.6))*5:y=(((H-h)/2)-sin(PI/2*(t*5.6))*100)+100:format=auto[jump3];[jump1_1][jump2_1][jump1_2][jump2_2][jump1_3][jump2_3][jump1_4][jump2_4][jump1_5][jump3]concat=n=10,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting -r 50 ${filepath}/output.gif`)
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
    help: { name: 'hankjump/hank {file}', value: 'hank jumping gif' },
    cooldown: 2500,
    type: 'Inside Joke'
}