module.exports = {
    name: ['areascale', 'expandscale'],
    args: [{ "name": "width", "required": true, "specifarg": false, "orig": "<width>" }, { "name": "height", "required": true, "specifarg": false, "orig": "<height>" }, { "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, {
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v]scale=${width}:${height}${keepaspectratio ? `:force_original_aspect_ratio=${keepaspectratio}` : ''}[background];[background][0:v]overlay=x=${originx}:y=${originy}:format=auto[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -map 0:a? -filter_complex "[1:v]scale=${width}:${height}${keepaspectratio ? `:force_original_aspect_ratio=${keepaspectratio}` : ''}[background];[background][0:v]overlay=x=${originx}:y=${originy}:format=auto,scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
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

            await execPromise(`ffmpeg -i ${filepath}/${filename} -i assets/image/transparent.png -filter_complex "[1:v]scale=${width}:${height}${keepaspectratio ? `:force_original_aspect_ratio=${keepaspectratio}` : ''}[background];[background][0:v]overlay=x=${originx}:y=${originy}:format=auto,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'areascale/expandscale <width> <height> {file} [-origin <x (left/center/right)> <y (top/middle/bottom)>] [-keepaspectratio <mode (increase or decrease)>]',
        value: 'Expands or contracts the area of the file to correspond to the specified width and height.'
    },
    cooldown: 2500,
    type: 'Resizing'
}