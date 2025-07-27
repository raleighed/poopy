module.exports = {
    name: ['hd'],
    args: [{ "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, {
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
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var hmult = Math.floor(Math.random() * 16) + 10
        var vmult = Math.floor(Math.random() * 16) + 10
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
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 400 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 400 : -1}${flag ? `:flags=${flag}` : ''},scale=iw/${hmult}:ih/${vmult}${flag ? `:flags=${flag}` : ''},scale=${width}:${height}${flag ? `:flags=${flag}` : ''}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }
            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -b:a 10k -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 400 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 400 : -1}${flag ? `:flags=${flag}` : ''},scale=iw/${hmult}:ih/${vmult}${flag ? `:flags=${flag}` : ''},scale=${width}:${height}${flag ? `:flags=${flag}` : ''},scale=ceil(iw/2)*2:ceil(ih/2)*2${flag ? `:flags=${flag}` : ''}[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var width = fileinfo.info.width
            var height = fileinfo.info.height

            var squareS = { value: ((height === width) && width) || ((height > width) && height) || width, constraint: ((height === width) && 'both') || ((height > width) && 'height') || 'width' }
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=${squareS.constraint === 'width' || squareS.constraint === 'both' ? 400 : -1}:${squareS.constraint === 'height' || squareS.constraint === 'both' ? 400 : -1}${flag ? `:flags=${flag}` : ''},scale=iw/${hmult}:ih/${vmult}${flag ? `:flags=${flag}` : ''},scale=${width}:${height}${flag ? `:flags=${flag}` : ''},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'hd {file} [-flags <algorithm>]',
        value: 'Makes the file Ultra HD 4k 2160p Blu-ray. A list of flags can be found at https://ffmpeg.org/ffmpeg-scaler.html#Scaler-Options'
    },
    cooldown: 2500,
    type: 'Effects'
}