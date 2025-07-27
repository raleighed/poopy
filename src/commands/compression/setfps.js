module.exports = {
    name: ['setfps'],
    args: [{"name":"fps","required":true,"specifarg":false,"orig":"<fps>"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"changespeed","required":false,"specifarg":true,"orig":"[-changespeed]"}],
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
        var fps = isNaN(Number(args[1])) ? undefined : Number(args[1]) <= 0.01 ? 0.01 : Number(args[1]) >= 60 ? 60 : Number(args[1]) || undefined
        if (fps === undefined) {
            await msg.reply('What is the FPS?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
        var fileinfo = await validateFile(currenturl, true).catch(async error => {
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            await execPromise(`ffmpeg ${args.find(arg => arg === '-changespeed') ? `-r ${fps} ` : ''}-i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${!args.find(arg => arg === '-changespeed') ? `-r ${fps} ` : ''}${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            if (fps > 50) {
                fps = 50
            }

            await execPromise(`ffmpeg ${args.find(arg => arg === '-changespeed') ? `-r ${fps} ` : ''}-i ${filepath}/${filename} -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${!args.find(arg => arg === '-changespeed') ? `-r ${fps} ` : ''}${filepath}/output.gif`)
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
        name: 'setfps <fps> {file} [-changespeed]',
        value: "Sets the file's FPS to <fps>."
    },
    cooldown: 2500,
    type: 'Compression'
}