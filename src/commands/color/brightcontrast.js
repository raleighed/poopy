module.exports = {
    name: ['brightcontrast', 'brightness', 'contrast'],
    args: [{ "name": "brightness", "required": false, "specifarg": false, "orig": "[brightness (from -10 to 10)]" }, { "name": "contrast", "required": false, "specifarg": false, "orig": "[contrast (from -10 to 10)]" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
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
        var brightness = (isNaN(Number(String(args[1]).replace(/,/g, ''))) ? 0 : Number(String(args[1]).replace(/,/g, '')) <= -10 ? -10 : Number(String(args[1]).replace(/,/g, '')) >= 10 ? 10 : Number(String(args[1]).replace(/,/g, '')) || 0) / 10
        var contrast = isNaN(Number(String(args[2]).replace(/,/g, ''))) ? 1 : Number(String(args[2]).replace(/,/g, '')) <= -10 ? -10 : Number(String(args[2]).replace(/,/g, '')) >= 10 ? 10 : Number(String(args[2]).replace(/,/g, '')) ?? 1
        var contrastreductions = 0
        var contrastfilters = []
        var c = contrast

        while (c > 2) {
            c -= 2
            contrastreductions++
        }

        for (var i = 0; i < contrastreductions; i++) {
            contrastfilters.push(`eq=contrast=2`)
        }

        contrastfilters.push(`eq=contrast=${c}`)

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
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]split[normal][extract];[extract]alphaextract[mask];[normal]eq=brightness=${brightness},${contrastfilters.join(',')}[bc];[bc][mask]alphamerge[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo
            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]eq=brightness=${brightness},${contrastfilters.join(',')},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo
            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]split[normal][extract];[extract]alphaextract[mask];[normal]eq=brightness=${brightness},${contrastfilters.join(',')}[bc];[bc][mask]alphamerge,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'brightcontrast/brightness/contrast [brightness (from -10 to 10)] [contrast (from -10 to 10)] {file}',
        value: "Changes the file's brightness and contrast values."
    },
    cooldown: 2500,
    type: 'Color'
}