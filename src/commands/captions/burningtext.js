module.exports = {
    name: ['burningtext', 'flamingtext', 'cooltext'],
    args: [{ "name": "prompt", "required": true, "specifarg": false, "orig": "<prompt>" }, { "name": "fontsize", "required": false, "specifarg": true, "orig": "[-fontsize <pixels>]" }, {
        "name": "origin", "required": false, "specifarg": true, "orig": "[-origin <x (left/center/right)> <y (top/middle/bottom)>]", "autocomplete": [
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
    }, { "name": "id", "required": false, "specifarg": true, "orig": "[-id <number (default 4)>]" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            parseNumber, request, validateFile,
            fetchPingPerms, downloadFile, sendFile
        } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })

        var id = 4
        var idIndex = args.indexOf('-id')
        if (idIndex > -1) {
            id = parseNumber(args[idIndex + 1], { dft: 4, round: true })
            args.splice(idIndex, 2)
        }

        var fontsize
        var fontsizeindex = args.indexOf('-fontsize')
        if (fontsizeindex > -1) {
            fontsize = isNaN(Number(args[fontsizeindex + 1])) ? undefined : Number(args[fontsizeindex + 1]) <= 5 ? 5 : Number(args[fontsizeindex + 1]) >= 600 ? 600 : Math.round(Number(args[fontsizeindex + 1])) || undefined
            args.splice(fontsizeindex, 2)
        }

        var origins = {
            top: {
                left: 0,
                center: 1,
                right: 2
            },
            middle: {
                left: 3,
                center: 4,
                right: 5
            },
            bottom: {
                left: 6,
                center: 7,
                right: 8
            }
        }
        var origin = 4
        var originindex = args.indexOf('-origin')
        if (originindex > -1) {
            var yorigin = origins[args[originindex + 2]] || origins.middle
            origin = yorigin[args[originindex + 1]] || yorigin.center
            args.splice(originindex, 3)
        }

        var saidMessage = args.slice(1).join(' ')
        if (args[1] === undefined) {
            await msg.reply('What is the text?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        }

        var form = {
            LogoID: id,
            Text: saidMessage,
            Boolean1: 'on',
            Integer9: origin,
            Integer13: 'on',
            Integer12: 'on',
        }

        if (fontsize != undefined) form.FontSize = fontsize

        var response = await request({
            url: 'https://cooltext.com/PostChange',
            method: 'POST',
            formData: form
        }).catch(() => { })

        if (!response || !response.data) {
            await msg.reply({
                content: `Error creating text from ID ${id}.`
            }).catch(() => { })
            return
        }

        var fileinfo = await validateFile(response.data.renderLocation.replace('https', 'http'), 'very true').catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        })

        if (!fileinfo) return

        var filepath = await downloadFile(response.data.renderLocation.replace('https', 'http'), `output.${fileinfo.type.ext}`)
        return await sendFile(msg, filepath, `output.${fileinfo.type.ext}`)
    },
    help: {
        name: 'burningtext/flamingtext/cooltext <prompt> [-fontsize <pixels>] [-origin <x (left/center/right)> <y (top/middle/bottom)>] [-id <number (default 4)>]',
        value: 'i love metallica!!!!!! If you put any different ID, it might use a different font. Try it yourself at https://cooltext.com'
    },
    cooldown: 2500,
    type: 'Captions'
}