module.exports = {
    name: ['vzoomin'],
    args: [{ "name": "multiplier", "required": false, "specifarg": false, "orig": "[multiplier (from 1 to 6)]" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, {
        "name": "origin", "required": false, "specifarg": true, "orig": "[-origin <x (left/center/right)> <y (top/middle/bottom)>]",
        "autocomplete": [
            'left top',
            'center top',
            'right top',
            'left middle',
            'center middle',
            'right middle',
            'left bottom',
            'center bottom',
            'right bottom',
        ]
    }, {
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
        var multiplier = isNaN(Number(args[1])) ? 2 : Number(args[1]) <= 1 ? 1 : Number(args[1]) >= 6 ? 6 : Number(args[1]) || 2
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
        var origins = {
            x: {
                left: '0',
                center: '(W-w)/2',
                right: '(W-w)'
            },

            y: {
                top: '0',
                middle: '(H-h)/2',
                bottom: '(H-h)'
            },
        }
        var originx = '(W-w)/2'
        var originy = '(H-h)/2'
        var originindex = args.indexOf('-origin')
        if (originindex > -1) {
            originx = origins.x[args[originindex + 1]] || '(W-w)/2'
            originy = origins.y[args[originindex + 2]] || '(H-h)/2'
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
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=rw:rh[background];[0:v]scale=iw:round(ih*${multiplier})${flag ? `:flags=${flag}` : ''}[overlay];[background][overlay]overlay=x=${originx}:y=${originy}:format=auto[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${fileinfo.info.width}:${fileinfo.info.height} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -map 0:a? -filter_complex "[1:v][0:v]scale=rw:rh[background];[0:v]scale=iw:round(ih*${multiplier})${flag ? `:flags=${flag}` : ''}[overlay];[background][overlay]overlay=x=${originx}:y=${originy}:format=auto,scale=ceil(iw/2)*2:ceil(ih/2)*2${flag ? `:flags=${flag}` : ''}[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${fileinfo.info.width}:${fileinfo.info.height} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v][0:v]scale=rw:rh[background];[0:v]scale=iw:round(ih*${multiplier})${flag ? `:flags=${flag}` : ''}[overlay];[background][overlay]overlay=x=${originx}:y=${originy}:format=auto,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -aspect ${fileinfo.info.width}:${fileinfo.info.height} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'vzoomin [multiplier (from 1 to 6)] {file} [-origin <x (left/center/right)> <y (top/middle/bottom)>] [-flags <algorithm>]',
        value: 'Zooms the file in vertically. A list of flags can be found at https://ffmpeg.org/ffmpeg-scaler.html#Scaler-Options'
    },
    cooldown: 2500,
    type: 'Resizing'
}