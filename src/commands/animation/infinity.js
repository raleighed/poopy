module.exports = {
    name: ['infinity', 'boss', 'fly'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"width","required":false,"specifarg":true,"orig":"[-width <pixels>]"},{"name":"height","required":false,"specifarg":true,"orig":"[-height <pixels>]"},{"name":"owidth","required":false,"specifarg":true,"orig":"[-owidth <pixels>]"},{"name":"oheight","required":false,"specifarg":true,"orig":"[-oheight <pixels>]"},{"name":"duration","required":false,"specifarg":true,"orig":"[-duration <seconds (max 10)>]"}],
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
        var duration = 2
        var durationindex = args.indexOf('-duration')
        if (durationindex > -1) {
            duration = isNaN(Number(args[durationindex + 1])) ? 2 : Number(args[durationindex + 1]) <= 0.05 ? 0.05 : Number(args[durationindex + 1]) >= 10 ? 10 : Number(args[durationindex + 1]) || 2
        }
        var width = 300
        var widthindex = args.indexOf('-width')
        if (widthindex > -1) {
            width = isNaN(Number(args[widthindex + 1])) ? 300 : Number(args[widthindex + 1]) <= 1 ? 1 : Number(args[widthindex + 1]) >= 1000 ? 1000 : Number(args[widthindex + 1]) || 300
        }
        var height = 300
        var heightindex = args.indexOf('-height')
        if (heightindex > -1) {
            height = isNaN(Number(args[heightindex + 1])) ? 300 : Number(args[heightindex + 1]) <= 1 ? 1 : Number(args[heightindex + 1]) >= 1000 ? 1000 : Number(args[heightindex + 1]) || 300
        }
        var owidth = 100
        var owidthindex = args.indexOf('-owidth')
        if (owidthindex > -1) {
            owidth = isNaN(Number(args[owidthindex + 1])) ? 100 : Number(args[owidthindex + 1]) <= 1 ? 1 : Number(args[owidthindex + 1]) >= 1000 ? 1000 : Number(args[owidthindex + 1]) || 100
        }
        var oheight = 100
        var oheightindex = args.indexOf('-oheight')
        if (oheightindex > -1) {
            oheight = isNaN(Number(args[oheightindex + 1])) ? 100 : Number(args[oheightindex + 1]) <= 1 ? 1 : Number(args[oheightindex + 1]) >= 1000 ? 1000 : Number(args[oheightindex + 1]) || 100
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
            await execPromise(`ffmpeg -stream_loop -1 -t ${duration} -i ${filepath}/${filename} -r 50 -stream_loop -1 -t ${duration} -i assets/image/transparent.png -filter_complex "[0:v]fps=50,scale=${owidth}:${oheight}:force_original_aspect_ratio=decrease[overlay];[1:v]scale=${width}:${height}[transparent];[transparent][overlay]overlay=x=((W-w)/2)-cos(PI/2*(t*4/${duration}))*${(width / 2) - (owidth / 2)}:y=((H-h)/2)-sin(PI*(t*4/${duration}))*${(height / 2) - (oheight / 2)}:format=auto,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting -r 50 -t ${duration} ${filepath}/output.gif`)
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
        name: 'infinity/boss/fly {file} [-width <pixels>] [-height <pixels>] [-owidth <pixels>] [-oheight <pixels>] [-duration <seconds (max 10)>]',
        value: 'Makes the file move around in an infinity symbol, similar to a boss battle.'
    },
    cooldown: 2500,
    type: 'Animation'
}