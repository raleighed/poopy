module.exports = {
    name: ['rap', 'fnf', 'friday'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let { lastUrl, validateFile, fetchPingPerms, execPromise, sendFile } = poopy.functions
        let vars = poopy.vars
        let config = poopy.config
        let { fs, Jimp } = poopy.modules

        const rapping = [
            {
                name: "1",
                position: [109, 101],
                angle: -3
            },
            {
                name: "2",
                position: [114, 102],
                angle: -1
            },
            {
                name: "3",
                position: [128, 102],
                angle: 9
            },
            {
                name: "4",
                position: [123, 106],
                angle: 5
            },
            {
                name: "5",
                position: [122, 98],
                angle: -14
            },
            {
                name: "6",
                position: [119, 100],
                angle: -9
            },
            {
                name: "7",
                position: [109, 103],
                angle: 10
            },
            {
                name: "8",
                position: [110, 102],
                angle: 6
            }
        ]
        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]
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
            var currentcount = vars.filecount
            vars.filecount++
            var filepath = `temp/${config.database}/file${currentcount}`
            fs.mkdirSync(`${filepath}`)
            fs.mkdirSync(`${filepath}/frames`)
            for (var i = 0; i < rapping.length; i++) {
                var rapFrame = rapping[i]
                var frame = await Jimp.read(currenturl)
                var rap = await Jimp.read(`assets/image/rapping/${rapFrame.name}.png`)
                var rapm = await Jimp.read(`assets/image/rappingmask/${rapFrame.name}.png`)
                var stage = await Jimp.read(`assets/image/stage.png`)
                var transparent = await Jimp.read(`assets/image/transparent.png`)
                var squareS = { value: ((frame.bitmap.height === frame.bitmap.width) && frame.bitmap.width) || ((frame.bitmap.height > frame.bitmap.width) && frame.bitmap.height) || frame.bitmap.width, constraint: ((frame.bitmap.height === frame.bitmap.width) && 'both') || ((frame.bitmap.height > frame.bitmap.width) && 'height') || 'width' }
                frame.resize(squareS.constraint === 'width' || squareS.constraint === 'both' ? 70 : Jimp.AUTO, squareS.constraint === 'height' || squareS.constraint === 'both' ? 70 : Jimp.AUTO)
                frame.rotate(rapFrame.angle)
                transparent.resize(stage.bitmap.width, stage.bitmap.height)
                transparent.composite(frame, rapFrame.position[0] - frame.bitmap.width / 2, rapFrame.position[1] - frame.bitmap.height + 10)
                transparent.mask(rapm, 0, 0)
                rap.composite(transparent, 0, 0)
                stage.composite(rap, 0, 0)
                await stage.writeAsync(`${filepath}/frames/${rapFrame.name}.png`)
            }
            await execPromise(`ffmpeg -i ${filepath}/frames/%d.png -vf palettegen=reserve_transparent=1 ${filepath}/palette.png`)
            await execPromise(`ffmpeg -r 25/2 -i ${filepath}/frames/%d.png -i ${filepath}/palette.png -lavfi "paletteuse=alpha_threshold=128" -gifflags -offsetting ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else if (type.mime.startsWith('video') || (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext))) {
            var currentcount = vars.filecount
            vars.filecount++
            var filepath = `temp/${config.database}/file${currentcount}`
            fs.mkdirSync(`${filepath}`)
            fs.mkdirSync(`${filepath}/frames`)
            await execPromise(`ffmpeg -i "${currenturl}" -vframes 1 ${filepath}/output.png`)
            for (var i = 0; i < rapping.length; i++) {
                var rapFrame = rapping[i]
                var frame = await Jimp.read(`${filepath}/output.png`)
                var rap = await Jimp.read(`assets/image/rapping/${rapFrame.name}.png`)
                var rapm = await Jimp.read(`assets/image/rappingmask/${rapFrame.name}.png`)
                var stage = await Jimp.read(`assets/image/stage.png`)
                var transparent = await Jimp.read(`assets/image/transparent.png`)
                var squareS = { value: ((frame.bitmap.height === frame.bitmap.width) && frame.bitmap.width) || ((frame.bitmap.height > frame.bitmap.width) && frame.bitmap.height) || frame.bitmap.width, constraint: ((frame.bitmap.height === frame.bitmap.width) && 'both') || ((frame.bitmap.height > frame.bitmap.width) && 'height') || 'width' }
                frame.resize(squareS.constraint === 'width' || squareS.constraint === 'both' ? 70 : Jimp.AUTO, squareS.constraint === 'height' || squareS.constraint === 'both' ? 70 : Jimp.AUTO)
                frame.rotate(rapFrame.angle)
                transparent.resize(stage.bitmap.width, stage.bitmap.height)
                transparent.composite(frame, rapFrame.position[0] - frame.bitmap.width / 2, rapFrame.position[1] - frame.bitmap.height + 10)
                transparent.mask(rapm, 0, 0)
                rap.composite(transparent, 0, 0)
                stage.composite(rap, 0, 0)
                await stage.writeAsync(`${filepath}/frames/${rapFrame.name}.png`)
            }
            await execPromise(`ffmpeg -i ${filepath}/frames/%d.png -vf palettegen=reserve_transparent=1 ${filepath}/palette.png`)
            await execPromise(`ffmpeg -r 25/2 -i ${filepath}/frames/%d.png -i ${filepath}/palette.png -lavfi "paletteuse=alpha_threshold=128" -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'rap/fnf/friday {file}',
        value: "when i'm funny Rapping !!!"
    },
    cooldown: 2500,
    type: 'Memes'
}