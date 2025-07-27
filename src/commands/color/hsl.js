module.exports = {
    name: ['hsl', 'hsv'],
    args: [{ "name": "hue", "required": false, "specifarg": false, "orig": "[hue (from -360 to 360)]" }, { "name": "saturation", "required": false, "specifarg": false, "orig": "[saturation (from -10 to 10)]" }, { "name": "lightness", "required": false, "specifarg": false, "orig": "[lightness (from -10 to 10)]" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[4] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var hue = isNaN(Number(String(args[1]).replace(/,/g, ''))) ? 0 : Number(String(args[1]).replace(/,/g, '')) <= -360 ? -360 : Number(String(args[1]).replace(/,/g, '')) >= 360 ? 360 : Number(String(args[1]).replace(/,/g, '')) || 0
        var saturation = isNaN(Number(String(args[2]).replace(/,/g, ''))) ? 1 : Number(String(args[2]).replace(/,/g, '')) <= -10 ? -10 : Number(String(args[2]).replace(/,/g, '')) >= 10 ? 10 : Number(String(args[2]).replace(/,/g, '')) ?? 1
        var lightness = isNaN(Number(String(args[3]).replace(/,/g, ''))) ? 0 : Number(String(args[3]).replace(/,/g, '')) <= -10 ? -10 : Number(String(args[3]).replace(/,/g, '')) >= 10 ? 10 : Number(String(args[3]).replace(/,/g, '')) || 0
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
                fileinfo
            })
            var filename = `input.png`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]hue=h=${hue}:s=${saturation}:b=${lightness}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo
            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]hue=h=${hue}:s=${saturation}:b=${lightness},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo
            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]hue=h=${hue}:s=${saturation}:b=${lightness},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'hsl/hsv [hue (from -360 to 360)] [saturation (from -10 to 10)] [lightness (from -10 to 10)] {file}',
        value: "Changes the file's hue, saturation and lightness values."
    },
    cooldown: 2500,
    type: 'Color'
}