module.exports = {
    name: ['topng', 'getframe', 'extractframe'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"framepos","required":false,"specifarg":true,"orig":"[-framepos <number>]"}],
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

        if (type.mime.startsWith('video') || type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            var frames = fileinfo.info.frames

            var pos = 1
            var posindex = args.indexOf('-framepos')
            if (posindex > -1) {
                pos = isNaN(Number(args[posindex + 1])) ? 1 : Number(args[posindex + 1]) <= 1 ? 1 : Number(args[posindex + 1]) >= frames ? frames : Math.round(Number(args[posindex + 1])) || 1
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]select='eq(n,${pos - 1})'[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
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
        name: 'topng/getframe/extractframe {file} [-framepos <number>]',
        value: 'Converts the video/GIF to a static PNG. Specifying the framepos param extracts the frame in the file with that position.'
    },
    cooldown: 2500,
    type: 'Conversion'
}