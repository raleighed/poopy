module.exports = {
    name: ['reencode'],
    args: [{ "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, {
        "name": "encodingpreset", "required": false, "specifarg": true, "orig": "[-encodingpreset <preset>]",
        "autocomplete": [
            'ultrafast',
            'superfast',
            'veryfast',
            'faster',
            'fast',
            'medium',
            'slow',
            'slower',
            'veryslow'
        ]
    }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, fetchPingPerms,
            downloadFile, execPromise, sendFile
        } = poopy.functions
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[4] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var presets = [
            'ultrafast',
            'superfast',
            'veryfast',
            'faster',
            'fast',
            'medium',
            'slow',
            'slower',
            'veryslow'
        ]
        var preset = 'medium'
        var presetindex = args.indexOf('-encodingpreset')
        if (presetindex > -1) {
            if (presets.find(preset => preset === args[presetindex + 1].toLowerCase())) {
                preset = args[presetindex + 1]
            } else {
                await msg.reply('Not a supported preset.').catch(() => { })
                return
            }
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

        if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -preset ${preset} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -preset ${preset} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${preset} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'reencode {file} [-encodingpreset <preset>]',
        value: 'Reencodes the file to other preset. A list of presets can be found at https://trac.ffmpeg.org/wiki/Encode/H.264#a2.Chooseapresetandtune\n' +
            'Pro Tip: These options can be used in ANY file manipulation command!'
    },
    cooldown: 2500,
    type: 'Compression'
}