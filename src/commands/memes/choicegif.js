module.exports = {
    name: ['choicegif'],
    args: [{"name":"name","required":false,"specifarg":false,"orig":"\"{name}\""},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let { Jimp, fs, Discord } = poopy.modules
        let {
            lastUrl, validateFile, downloadFile,
            fetchPingPerms, execPromise, sendFile
        } = poopy.functions
        let vars = poopy.vars
        let config = poopy.config

        const gifframes = [
            {
                name: '{text}',
                filename: '1.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'blue',
                            params: [-255]
                        },

                        {
                            apply: 'green',
                            params: [-255]
                        }
                    ])
                },
                name: 'Red {text}',
                filename: '2.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'blue',
                            params: [-255]
                        },

                        {
                            apply: 'red',
                            params: [-255]
                        }
                    ])
                },
                name: 'Green {text}',
                filename: '3.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'red',
                            params: [-255]
                        },

                        {
                            apply: 'green',
                            params: [-255]
                        }
                    ])
                },
                name: 'Blue {text}',
                filename: '4.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                },
                name: '50\'s {text}',
                filename: '6.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width / 6, frame.bitmap.height / 6)
                },
                name: 'Tiny {text}',
                filename: '7.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width * 3, frame.bitmap.height * 3)
                },
                name: 'Giant {text}',
                filename: '8.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width / 4, frame.bitmap.height / 4, Jimp.RESIZE_NEAREST_NEIGHBOR)
                    frame.resize(frame.bitmap.width * 4, frame.bitmap.height * 4, Jimp.RESIZE_NEAREST_NEIGHBOR)
                },
                name: '8-bit {text}',
                filename: '9.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width / 6, frame.bitmap.height / 6)
                    frame.resize(frame.bitmap.width * 6, frame.bitmap.height * 6)
                },
                name: 'Crunchy {text}',
                filename: '10.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'green',
                            params: [-100]
                        },

                        {
                            apply: 'red',
                            params: [-100]
                        },

                        {
                            apply: 'blue',
                            params: [-100]
                        }
                    ])
                },
                name: 'Nightmare {text}',
                filename: '11.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'green',
                            params: [70]
                        },

                        {
                            apply: 'red',
                            params: [70]
                        },

                        {
                            apply: 'blue',
                            params: [70]
                        }
                    ])
                },
                name: 'Ghost {text}',
                filename: '12.png'
            },

            {
                edit: async function (frame) {
                    frame.convolute([
                        [0, -1, 0],
                        [-1, 4, -1],
                        [0, -1, 0]
                    ])
                    frame.convolute([
                        [0, -1, 0],
                        [-1, 4, -1],
                        [0, -1, 0]
                    ])
                },
                name: 'what',
                filename: '13.png'
            },

            {
                edit: async function (frame) {
                    frame.convolute([
                        [-1, -1, -1],
                        [-1, 9, -1],
                        [-1, -1, -1]
                    ])
                    frame.convolute([
                        [-1, -1, -1],
                        [-1, 9, -1],
                        [-1, -1, -1]
                    ])
                },
                name: 'Distorted {text}',
                filename: '14.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.contrast(1)
                },
                name: 'Silhouette {text}',
                filename: '15.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width / 40, frame.bitmap.height / 40)
                },
                name: '{text} Bacteria',
                filename: '16.png'
            },

            {
                edit: async function (frame) {
                    frame.invert()
                },
                name: 'Inverted {text}',
                filename: '17.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width, frame.bitmap.height / 4)
                },
                name: 'Squashed {text}',
                filename: '18.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width, frame.bitmap.height * 4)
                },
                name: 'hi',
                filename: '19.png'
            },

            {
                edit: async function (frame) {
                    frame.color([
                        {
                            apply: 'green',
                            params: [255]
                        },
                    ])
                },
                name: 'Nuclear {text}',
                filename: '20.png'
            },

            {
                edit: async function (frame) {
                    frame.contrast(0.9)
                },
                name: '{text} Fry',
                filename: '21.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'blue',
                            params: [-255]
                        },

                        {
                            apply: 'green',
                            params: [-100]
                        }
                    ])
                },
                name: 'Hot {text}',
                filename: '22.png'
            },

            {
                edit: async function (frame) {
                    frame.greyscale()
                    frame.color([
                        {
                            apply: 'red',
                            params: [-255]
                        },

                        {
                            apply: 'green',
                            params: [-100]
                        }
                    ])
                },
                name: 'Cold {text}',
                filename: '23.png'
            },

            {
                edit: async function (frame) {
                    frame.blur(5)
                },
                name: 'Blurred {text}',
                filename: '24.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width * 12, frame.bitmap.height * 12)
                },
                name: 'Island-sized {text}',
                filename: '25.png'
            },

            {
                edit: async function (frame) {
                    frame.resize(frame.bitmap.width, 1, Jimp.RESIZE_NEAREST_NEIGHBOR)
                    frame.resize(frame.bitmap.width, 500, Jimp.RESIZE_NEAREST_NEIGHBOR)
                },
                name: '{text}\n{text}\n{text}\n{text}\n{text}\n{text}\n{text}',
                filename: '26.png'
            },

            {
                edit: async function (frame) {
                    var stripes = await Jimp.read('assets/image/stripes.png')
                    frame.greyscale()
                    stripes.resize(frame.bitmap.width, frame.bitmap.height)
                    frame.composite(stripes, 0, 0)
                    frame.convolute([
                        [0, -1, 0],
                        [-1, 4, -1],
                        [0, -1, 0]
                    ])
                },
                name: 'The Anonymous {text}',
                filename: '27.png'
            },

            {
                edit: async function (frame) {
                    var jail = await Jimp.read('assets/image/jailed.png')
                    jail.resize(frame.bitmap.width, frame.bitmap.height)
                    frame.composite(jail, 0, 0)
                },
                name: 'Jailed {text}',
                filename: '28.png'
            },
        ]
        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var saidMessage = args.slice(1).join(' ')
        vars.symbolreplacements.forEach(symbolReplacement => {
            symbolReplacement.target.forEach(target => {
                saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
            })
        })
        var matchedTextes = saidMessage.match(/"([\s\S]*?)"/)
        if (!matchedTextes) {
            matchedTextes = ['""', '']
        }
        var text = matchedTextes[1]
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
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`
            fs.mkdirSync(`${filepath}/frames`)

            for (var i = 0; i < gifframes.length; i++) {
                var framedata = gifframes[i]
                var frame = await Jimp.read(`${filepath}/${filename}`)
                var white = await Jimp.read(`assets/image/white.png`)
                var arialsmall = await Jimp.loadFont('assets/fonts/ArialSmall/ArialSmall.fnt')
                var arialbig = await Jimp.loadFont('assets/fonts/ArialBig/ArialBig.fnt')
                var squareS = { value: ((frame.bitmap.height === frame.bitmap.width) && frame.bitmap.width) || ((frame.bitmap.height > frame.bitmap.width) && frame.bitmap.height) || frame.bitmap.width, constraint: ((frame.bitmap.height === frame.bitmap.width) && 'both') || ((frame.bitmap.height > frame.bitmap.width) && 'height') || 'width' }
                frame.resize(squareS.constraint === 'width' || squareS.constraint === 'both' ? 180 : Jimp.AUTO, squareS.constraint === 'height' || squareS.constraint === 'both' ? 180 : Jimp.AUTO)
                white.resize(304, 361)
                if (framedata.edit) {
                    await framedata.edit(frame)
                }
                white.composite(frame, white.bitmap.width / 2 - frame.bitmap.width / 2, white.bitmap.height / 2 - frame.bitmap.height / 2)
                await white.print(arialbig, 8, 8, { text: Discord.Util.cleanContent('Choose your {text}'.replace(/{text}/g, text), msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 288, 73)
                await white.print(arialsmall, 8, 280, { text: Discord.Util.cleanContent(framedata.name.replace(/{text}/g, text), msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 288, 73)
                await white.writeAsync(`${filepath}/frames/${framedata.filename}`)
            }

            await execPromise(`ffmpeg -i ${filepath}/frames/%d.png -vf palettegen=reserve_transparent=1 ${filepath}/palette.png`)
            await execPromise(`ffmpeg -i ${filepath}/frames/%d.png -i ${filepath}/palette.png -lavfi "paletteuse=alpha_threshold=128" -gifflags -offsetting ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else if (type.mime.startsWith('video') || (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext))) {
            var currentcount = vars.filecount
            vars.filecount++
            var filepath = `temp/${config.database}/file${currentcount}`
            fs.mkdirSync(`${filepath}`)
            fs.mkdirSync(`${filepath}/frames`)

            await execPromise(`ffmpeg -i "${currenturl}" -vframes 1 ${filepath}/output.png`)
            for (var i = 0; i < gifframes.length; i++) {
                var framedata = gifframes[i]
                var frame = await Jimp.read(`${filepath}/output.png`)
                var white = await Jimp.read(`assets/image/white.png`)
                var arialsmall = await Jimp.loadFont('assets/fonts/ArialSmall/ArialSmall.fnt')
                var arialbig = await Jimp.loadFont('assets/fonts/ArialBig/ArialBig.fnt')
                var squareS = { value: ((frame.bitmap.height === frame.bitmap.width) && frame.bitmap.width) || ((frame.bitmap.height > frame.bitmap.width) && frame.bitmap.height) || frame.bitmap.width, constraint: ((frame.bitmap.height === frame.bitmap.width) && 'both') || ((frame.bitmap.height > frame.bitmap.width) && 'height') || 'width' }
                frame.resize(squareS.constraint === 'width' || squareS.constraint === 'both' ? 180 : Jimp.AUTO, squareS.constraint === 'height' || squareS.constraint === 'both' ? 180 : Jimp.AUTO)
                white.resize(304, 361)
                if (framedata.edit) {
                    await framedata.edit(frame)
                }
                white.composite(frame, white.bitmap.width / 2 - frame.bitmap.width / 2, white.bitmap.height / 2 - frame.bitmap.height / 2)
                await white.print(arialbig, 8, 8, { text: Discord.Util.cleanContent('Choose your {text}'.replace(/{text}/g, text), msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 288, 73)
                await white.print(arialsmall, 8, 280, { text: Discord.Util.cleanContent(framedata.name.replace(/{text}/g, text), msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 288, 73)
                await white.writeAsync(`${filepath}/frames/${framedata.filename}`)
            }
            await execPromise(`ffmpeg -i ${filepath}/frames/%d.png -vf palettegen=reserve_transparent=1 ${filepath}/palette.png`)
            await execPromise(`ffmpeg -i ${filepath}/frames/%d.png -i ${filepath}/palette.png -lavfi "paletteuse=alpha_threshold=128" -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'choicegif "{name}" {file}',
        value: 'Creates one of those "Choose your fighter" gifs depending on the selected image.'
    },
    cooldown: 2500,
    type: 'Memes'
}