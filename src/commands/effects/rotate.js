module.exports = {
    name: ['rotate', 'rot'],
    args: [{"name":"degrees","required":false,"specifarg":false,"orig":"{degrees (from -360 to 360)}"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"cut","required":false,"specifarg":true,"orig":"[-cut]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var degrees = isNaN(Number(args[1])) ? 0 : Number(args[1]) <= -360 ? -360 : Number(args[1]) >= 360 ? 360 : Number(args[1]) || 0
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
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]rotate=${degrees}*PI/180${!(args.find(arg => arg === '-cut')) ? `:ow=rotw(${degrees}*PI/180):oh=roth(${degrees}*PI/180)` : ''}:c=0x00000000[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]rotate=${degrees}*PI/180${!(args.find(arg => arg === '-cut')) ? `:ow=rotw(${degrees}*PI/180):oh=roth(${degrees}*PI/180)` : ''}:c=0x00000000,scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]rotate=${degrees}*PI/180${!(args.find(arg => arg === '-cut')) ? `:ow=rotw(${degrees}*PI/180):oh=roth(${degrees}*PI/180)` : ''}:c=0x00000000,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'rotate/rot {degrees (from -360 to 360)} {file} [-cut]',
        value: 'Rotates the file by the degrees specified.'
    },
    cooldown: 2500,
    type: 'Effects'
}