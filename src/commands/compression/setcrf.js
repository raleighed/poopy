module.exports = {
    name: ['setcrf'],
    args: [{"name":"crf","required":true,"specifarg":false,"orig":"<crf (from 0 to 51)>"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
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
        var crf = isNaN(Number(args[1])) ? undefined : Number(args[1]) <= 0 ? 0 : Number(args[1]) >= 51 ? 51 : Math.round(Number(args[1])) || undefined
        if (crf === undefined) {
            await msg.reply('What is the CRF?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -crf ${crf} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -crf ${crf} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/converted.mp4`)
            await execPromise(`ffmpeg -i ${filepath}/converted.mp4 -preset ${findpreset(args)} -vframes 1 ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -crf ${crf} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/converted.mp4`)
            await execPromise(`ffmpeg -i ${filepath}/converted.mp4 -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'setcrf <crf (from 0 to 51)> {file}',
        value: "Sets the file's CRF to <crf>. A higher CRF means worse quality."
    },
    cooldown: 2500,
    type: 'Compression'
}