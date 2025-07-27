module.exports = {
    name: ['scale', 'resize'],
    args: [{ "name": "width", "required": true, "specifarg": false, "orig": "<width>" }, { "name": "height", "required": true, "specifarg": false, "orig": "<height>" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, {
        "name": "flags", "required": false, "specifarg": true, "orig": "[-flags <algorithm>]",
        "autocomplete": [
            'fast_bilinear',
            'bilinear',
            'bicubic',
            'experimental',
            'neighbor',
            'area',
            'bicublin',
            'gauss',
            'sinc',
            'lanczos',
            'spline',
            'print_info',
            'accurate_rnd',
            'full_chroma_int',
            'full_chroma_inp',
            'bitexact'
        ]
    }, { "name": "keepaspectratio", "required": false, "specifarg": true, "orig": "[-keepaspectratio <mode (increase or decrease)>]", "autocomplete": ['increase', 'decrease'] }],
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
        var keepaspectratio
        var width = isNaN(Number(args[1])) ? undefined : Number(args[1]) <= 1 ? 1 : Number(args[1]) >= 3000 ? 3000 : Number(args[1]) || undefined
        if (width === undefined) {
            await msg.reply('What is the width?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
        var height = isNaN(Number(args[2])) ? undefined : Number(args[2]) <= 1 ? 1 : Number(args[2]) >= 3000 ? 3000 : Number(args[2]) || undefined
        if (height === undefined) {
            await msg.reply('What is the height?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }
        var flags = [
            'fast_bilinear',
            'bilinear',
            'bicubic',
            'experimental',
            'neighbor',
            'area',
            'bicublin',
            'gauss',
            'sinc',
            'lanczos',
            'spline',
            'print_info',
            'accurate_rnd',
            'full_chroma_int',
            'full_chroma_inp',
            'bitexact'
        ]
        var flag = undefined
        var flagsindex = args.indexOf('-flags')
        if (flagsindex > -1) {
            if (flags.find(flag => flag === args[flagsindex + 1].toLowerCase())) {
                flag = args[flagsindex + 1]
            } else {
                await msg.reply('Not a supported flag.').catch(() => { })
                return
            }
        }
        var ratioindex = args.indexOf('-keepaspectratio')
        if (ratioindex > -1) {
            if (args[ratioindex + 1] == 'increase' || args[ratioindex + 1] == 'decrease') {
                keepaspectratio = args[ratioindex + 1]
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=${width}:${height}${flag ? `:flags=${flag}` : ''}${keepaspectratio ? `:force_original_aspect_ratio=${keepaspectratio}` : ''}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            if (width > 2000) {
                width = 2000
            }
            if (height > 2000) {
                height = 2000
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]scale=${width}:${height}${flag ? `:flags=${flag}` : ''}${keepaspectratio ? `:force_original_aspect_ratio=${keepaspectratio}` : ''},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            if (width > 1000) {
                width = 1000
            }
            if (height > 1000) {
                height = 1000
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=${width}:${height}${flag ? `:flags=${flag}` : ''}${keepaspectratio ? `:force_original_aspect_ratio=${keepaspectratio}` : ''},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'scale/resize <width> <height> {file} [-flags <algorithm>] [-keepaspectratio <mode (increase or decrease)>]',
        value: 'Resizes the file to correspond to the specified width and height. A list of flags can be found at https://ffmpeg.org/ffmpeg-scaler.html#Scaler-Options'
    },
    cooldown: 2500,
    type: 'Resizing'
}