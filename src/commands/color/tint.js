module.exports = {
    name: ['tint'],
    args: [{ "name": "r", "required": false, "specifarg": false, "orig": "[r]" }, { "name": "g", "required": false, "specifarg": false, "orig": "[g]" }, { "name": "b", "required": false, "specifarg": false, "orig": "[b]" }, { "name": "a", "required": false, "specifarg": false, "orig": "[a]" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
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
        var r = (isNaN(Number(String(args[1]).replace(/,/g, ''))) ? 0 : Number(String(args[1]).replace(/,/g, '')) <= 0 ? 0 : Number(String(args[1]).replace(/,/g, '')) >= 255 ? 255 : Number(String(args[1]).replace(/,/g, '')) || 0).toString(16).padStart(2, '0')
        var g = (isNaN(Number(String(args[2]).replace(/,/g, ''))) ? 0 : Number(String(args[2]).replace(/,/g, '')) <= 0 ? 0 : Number(String(args[2]).replace(/,/g, '')) >= 255 ? 255 : Number(String(args[2]).replace(/,/g, '')) || 0).toString(16).padStart(2, '0')
        var b = (isNaN(Number(String(args[3]).replace(/,/g, ''))) ? 0 : Number(String(args[3]).replace(/,/g, '')) <= 0 ? 0 : Number(String(args[3]).replace(/,/g, '')) >= 255 ? 255 : Number(String(args[3]).replace(/,/g, '')) || 0).toString(16).padStart(2, '0')
        var a = isNaN(Number(String(args[4]).replace(/,/g, ''))) ? 179 : Number(String(args[4]).replace(/,/g, '')) <= 0 ? 0 : Number(String(args[4]).replace(/,/g, '')) >= 255 ? 255 : Number(String(args[4]).replace(/,/g, '')) ?? 179
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
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i ${filepath}/${filename} -f lavfi -i "color=0x${r}${g}${b}:s=${width}x${height},format=rgba" -filter_complex "[0:v][1:v]blend=shortest=1:all_mode=overlay:all_opacity=${a / 255}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo
            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i ${filepath}/${filename} -f lavfi -i "color=0x${r}${g}${b}:s=${width}x${height},format=rgba" -map 0:a? -filter_complex "[0:v][1:v]blend=shortest=1:all_mode=overlay:all_opacity=${a / 255},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo
            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            await execPromise(`ffmpeg -i ${filepath}/${filename} -f lavfi -i "color=0x${r}${g}${b}:s=${width}x${height},format=rgba" -filter_complex "[0:v][1:v]blend=shortest=1:all_mode=overlay:all_opacity=${a / 255},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'tint [r] [g] [b] [a] {file}',
        value: 'Tints the file with the new color depending on the RGBA values.'
    },
    cooldown: 2500,
    type: 'Color'
}