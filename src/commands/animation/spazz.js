module.exports = {
    name: ['spazz', 'shake'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"radius","required":false,"specifarg":true,"orig":"[-radius <number>]"},{"name":"seed","required":false,"specifarg":true,"orig":"[-seed <number>]"},{"name":"rescale","required":false,"specifarg":true,"orig":"[-rescale]"}],
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
        var seed = Math.random() * 1000
        var seedindex = args.indexOf('-seed')
        if (seedindex > -1) {
            seed = isNaN(Number(args[seedindex + 1])) ? Math.random() * 1000 : Number(args[seedindex + 1]) || Math.random() * 1000
        }
        var radius = 50
        var radiusindex = args.indexOf('-radius')
        if (radiusindex > -1) {
            radius = isNaN(Number(args[radiusindex + 1])) ? 50 : Number(args[radiusindex + 1]) <= 0 ? 0 : Number(args[radiusindex + 1]) ?? 50
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
            await execPromise(`ffmpeg ${!(vars.gifFormats.find(f => f === type.ext)) ? `-r 50 -stream_loop -1 -t 2 ` : ''}-i ${filepath}/${filename} ${!(vars.gifFormats.find(f => f === type.ext)) ? `-r 50 -stream_loop -1 -t 2 ` : ''}-i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=${args.find(arg => arg === '-rescale') ? `w=rw+${radius}:h=rh+${radius}` : 'rw:rh'}[transparent];[transparent][0:v]overlay=x=(W-w)/2+${radius / 2}-random(t*(random(0)*${seed}))*${radius}:y=(H-h)/2+${radius / 2}-random(t*(random(0)*${seed}))*${radius}:format=auto,scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -aspect ${width}:${height} -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            var width = fileinfo.info.width
            var height = fileinfo.info.height
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=${args.find(arg => arg === '-rescale') ? `w=rw+${radius}:h=rh+${radius}` : 'rw:rh'}[transparent];[transparent][0:v]overlay=x=(W-w)/2+${radius / 2}-random(t*(random(0)*${seed}))*${radius}:y=(H-h)/2+${radius / 2}-random(t*(random(0)*${seed}))*${radius}:format=auto[out]" -map "[out]" -map 0:a? -c:v libx264 -pix_fmt yuv420p -aspect ${width}:${height} -preset ${findpreset(args)} ${filepath}/output.mp4`)
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
        name: 'spazz/shake {file} [-radius <number>] [-seed <number>] [-rescale]',
        value: 'Makes the file spazz out.'
    },
    cooldown: 2500,
    type: 'Animation'
}