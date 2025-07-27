module.exports = {
    name: ['pseudocolor'],
    args: [{ "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, {
        "name": "preset", "required": false, "specifarg": true, "orig": "[-preset <preset>]",
        "autocomplete": [
            'magma',
            'inferno',
            'plasma',
            'viridis',
            'turbo',
            'cividis',
            'range1',
            'range2',
            'shadows',
            'highlights',
            'solar',
            'nominal',
            'preferred',
            'total'
        ]
    }],
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
        var presets = [
            'magma',
            'inferno',
            'plasma',
            'viridis',
            'turbo',
            'cividis',
            'range1',
            'range2',
            'shadows',
            'highlights',
            'solar',
            'nominal',
            'preferred',
            'total'
        ]
        var preset = 'turbo'
        var presetindex = args.indexOf('-preset')
        if (presetindex > -1) {
            if (presets.find(preset => preset === args[presetindex + 1].toLowerCase())) {
                preset = args[presetindex + 1].toLowerCase()
            } else {
                await msg.reply('Not a supported preset.').catch(() => { })
                return
            }
        }
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
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]pseudocolor=preset=${preset}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo
            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]pseudocolor=preset=${preset},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo
            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]pseudocolor=preset=${preset},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'pseudocolor {file} [-preset <preset>]',
        value: 'Gives the file a new color, depending on the specified preset. A list of presets can be found at https://ffmpeg.org/ffmpeg-filters.html#pseudocolor'
    },
    cooldown: 2500,
    type: 'Color'
}