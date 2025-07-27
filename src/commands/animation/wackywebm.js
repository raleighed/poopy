module.exports = {
    name: ['wackywebm',
        'wackyscale',
        'wackyresize'],
    args: [{
        "name": "video",
        "required": true,
        "specifarg": false,
        "orig": "<video>"
    },
        {
            "name": "mode",
            "required": false,
            "specifarg": true,
            "orig": "[-mode <value (bounce, shutter, sporadic, bounce+shutter)>]",
            "autocomplete": [
                'bounce',
                'shutter',
                'sporadic',
                'bounce+shutter'
            ]
        },
        {
            "name": "delta",
            "required": false,
            "specifarg": true,
            "orig": "[-delta <number (default 2)>]"
        },
        {
            "name": "bps",
            "required": false,
            "specifarg": true,
            "orig": "[-bps <number (default 1.9)>]"
        }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, getOption, parseString, parseNumber, fetchPingPerms,
            validateFile, downloadFile, wackywebm, sendFile
        } = poopy.functions
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => {})
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]

        var modes = [
            'bounce',
            'shutter',
            'sporadic',
            'bounce+shutter'
        ]

        var mode = getOption(args, 'mode', {
            dft: 'bounce', func: (mode) => parseString(mode, modes, {
                lower: true
            })
        })
        if (!mode) {
            await msg.reply('Not a supported mode.').catch(() => {})
            return
        }

        var delta = getOption(args, 'delta', {
            dft: 2, func: (delta) => parseNumber(delta, {
                dft: 2, min: 0.01, max: 100
            })
        })
        var bps = getOption(args, 'bps', {
            dft: 1.9, func: (bps) => parseNumber(bps, {
                dft: 1.9, min: 0.01, max: 100
            })
        })

        var fileinfo = await validateFile(currenturl).catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return;
        })

        if (!fileinfo) return
        var type = fileinfo.type

        if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext) || type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`

            await wackywebm(mode, `${filepath}/${filename}`, {
                delta: delta,
                bouncesPerSecond: bps
            })

            return await sendFile(msg, filepath, `output.webm`)
        } else {
            await msg.reply({
                content: `Unsupported file: \`${currenturl}\``,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return
        }
    },
    help: {
        name: 'wackywebm/wackyscale/wackyresize <video> [-mode <value (bounce, shutter, sporadic, bounce+shutter)>] [-delta <number (default 2)>] [-bps <number (default 1.9)>]',
        value: "Manipulates the video to make it a WebM that scales wackily during playtime."
    },
    cooldown: 2500,
    type: 'Animation'
}