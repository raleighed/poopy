module.exports = {
    name: ['iceberg'],
    args: [{"name":"stage1words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage1image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage2words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage2image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage3words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage3image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage4words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage4image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage5words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage5image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage6words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage6image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage7words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage7image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage8words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage8image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage9words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage9image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stage10words","required":false,"specifarg":true,"orig":"{-stage<stagenumber>words <word1 | word2 | ...>}"},{"name":"stage10image","required":false,"specifarg":true,"orig":"{-stage<stagenumber>image <image>}"},{"name":"stages","required":false,"specifarg":true,"orig":"[-stages <stagenumber (from 1 to 10)>]"}],
    noargchange: true,
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, lastUrls,
            fetchPingPerms, downloadFile, sendFile
        } = poopy.functions
        let vars = poopy.vars
        let config = poopy.config
        let { fs, Jimp, Discord } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What are the files?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var saidMessage = args.slice(1).join(' ')
        var stages = 10
        var stageindex = args.indexOf('-stages')
        if (stageindex > -1) {
            stages = isNaN(Number(args[stageindex + 1])) ? 10 : Number(args[stageindex + 1]) <= 1 ? 1 : Number(args[stageindex + 1]) >= 10 ? 10 : Math.round(Number(args[stageindex + 1])) || 10
        }
        var stagewords = {}
        var stageimages = {}
        var stagewrdsdimensions = {
            stage1: [0, 0, 1263, 266],
            stage2: [0, 273, 1263, 263],
            stage3: [0, 543, 1263, 311],
            stage4: [0, 861, 1263, 277],
            stage5: [0, 1145, 1263, 282],
            stage6: [0, 1434, 1263, 251],
            stage7: [0, 1692, 1263, 269],
            stage8: [0, 1969, 1263, 270],
            stage9: [0, 2246, 1263, 292],
            stage10: [0, 2545, 1263, 270],
        }
        var stageimgdimensions = {
            stage1: [1287, 0, 293, 266],
            stage2: [1287, 273, 293, 263],
            stage3: [1287, 543, 293, 311],
            stage4: [1287, 861, 293, 277],
            stage5: [1287, 1145, 293, 282],
            stage6: [1287, 1434, 293, 251],
            stage7: [1287, 1692, 293, 269],
            stage8: [1287, 1969, 293, 270],
            stage9: [1287, 2246, 293, 292],
            stage10: [1287, 2545, 293, 270],
        }
        var stagematches = saidMessage.match(/-stage([1-9]|10)(words|image)/g)
        if (stagematches) {
            for (var i in stagematches) {
                var stagematch = stagematches[i]
                var stagematch2 = stagematch.match(/^-stage[0-9]+(words|image)$/)
                var argIndex = args.indexOf(stagematch)
                var nextArgs = args.slice(argIndex + 1)
                var arg = ''
                for (var j in nextArgs) {
                    var nextArg = nextArgs[j]
                    if (nextArg.match(/^-stage[0-9]+(words|image)$|^-stages$/)) break
                    arg += `${nextArg} `
                }
                arg = arg.substring(0, arg.length - 1)
                var stagenumber = stagematch.substring(6, stagematch.length - stagematch2[1].length)
                var stagetype = stagematch2[1]
                if (stagetype === 'words') {
                    var words = arg.split(/ ?\| ?/)
                    stagewords['stage' + stagenumber] = words
                } else {
                    stageimages['stage' + stagenumber] = arg
                }
            }
        }

        var filetypes = {}
        var infos = {}
        var lasturlserror = ''
        var nofiles = !(Object.keys(stageimages).length)

        if (nofiles) {
            var validfilecount = 0

            async function inspect(url) {
                var lasturlerror
                var fileinfo = await validateFile(url, false, {
                    size: `one of the files exceeds the size limit of {param} mb hahahaha (try to use the shrink, setfps, trim or crunch commands)`,
                    frames: `the frames of one of the files exceed the limit of {param} hahahaha (try to use the setfps or the trim commands)`,
                    width: `the width of one of the files exceeds the limit of {param} hahahaha (try to use the shrink command)`,
                    height: `the height of one of the files exceeds the limit of {param} hahahaha (try to use the shrink command)`
                }).catch(error => {
                    lasturlerror = error
                    lasturlserror = error
                })
                if (lasturlerror || !fileinfo) return false
                var filetype = fileinfo.type
                if (!filetype || !(filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext)) && vars.jimpFormats.find(f => f === filetype.ext))) {
                    lasturlerror = error
                    lasturlserror = `Unsupported file: ${url}`
                    return false
                }
                frameurls['stage' + (validfilecount + 1)] = url
                filetypes['stage' + (validfilecount + 1)] = filetype
                infos['stage' + (validfilecount + 1)] = fileinfo
                nofiles = false
                return true
            }

            var lasturls = lastUrls(msg)

            for (var i in lasturls) {
                var url = lasturls[i]
                var success = await inspect(url).catch(() => { })
                if (success) validfilecount += 1
                if (validfilecount >= stages) break
            }
        }

        if (nofiles && lasturlserror) {
            await msg.reply({
                content: lasturlserror,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        }

        for (var stage in stageimages) {
            if (!filetypes[stage] || !infos[stage]) {
                var error
                var imageurl = stageimages[stage]
                var fileinfo = await validateFile(imageurl, false, {
                    size: `one of the files exceeds the size limit of {param} mb hahahaha (try to use the shrink, setfps, trim or crunch commands)`,
                    frames: `the frames of one of the files exceed the limit of {param} hahahaha (try to use the setfps or the trim commands)`,
                    width: `the width of one of the files exceeds the limit of {param} hahahaha (try to use the shrink command)`,
                    height: `the height of one of the files exceeds the limit of {param} hahahaha (try to use the shrink command)`
                }).catch(err => {
                    error = err
                })
                if (error) {
                    await msg.reply({
                        content: error,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    await msg.channel.sendTyping().catch(() => { })
                    return
                }
                var filetype = fileinfo.type
                if (!(filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext)) && vars.jimpFormats.find(f => f === filetype.ext))) error = `Unsupported file: \`${imageurl}\``
                if (error) {
                    await msg.reply({
                        content: error,
                        allowedMentions: {
                            parse: fetchPingPerms(msg)
                        }
                    }).catch(() => { })
                    await msg.channel.sendTyping().catch(() => { })
                    return
                }
                filetypes[stage] = filetype
                infos[stage] = fileinfo
            }
        }

        var currentcount = vars.filecount
        vars.filecount++
        var filepath = `temp/${config.database}/file${currentcount}`
        fs.mkdirSync(`${filepath}`)

        var iceberg = await Jimp.read(`assets/image/iceberg.png`)
        var arialr = await Jimp.loadFont(`assets/fonts/ArialRed/ArialRed.fnt`)

        for (var i in stageimages) {
            var imageurl = stageimages[i]
            var filetype = filetypes[i]
            var info = infos[i]
            var dimensions = stageimgdimensions[i]

            await downloadFile(imageurl, `${i}.png`, {
                fileinfo: info,
                filepath: filepath
            })
            var image = await Jimp.read(`${filepath}/${i}.png`)
            image.resize(dimensions[2], dimensions[3])
            iceberg.composite(image, dimensions[0], dimensions[1])
        }

        for (var i in stagewords) {
            var words = stagewords[i]
            var wordsS = []
            for (var j in words) {
                var word = words[j]
                wordsS.push(word)
                wordsS.push(' '.repeat(Math.floor((Math.floor(Math.random() * 61) + 30) / words.length / (word.length / 15))))
            }
            wordsS.splice(wordsS.length - 1)
            var text = wordsS.join('')
            var dimensions = stagewrdsdimensions[i]

            await iceberg.print(arialr, dimensions[0], dimensions[1], { text: Discord.Util.cleanContent(text, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, dimensions[2], dimensions[3])
        }

        iceberg.crop(0, 0, iceberg.bitmap.width, stagewrdsdimensions['stage' + stages][1] + stagewrdsdimensions['stage' + stages][3])

        await iceberg.writeAsync(`${filepath}/output.png`)

        return await sendFile(msg, filepath, `output.png`)
    },
    help: {
        name: 'iceberg {-stage<stagenumber>words <word1 | word2 | ...>} {-stage<stagenumber>image <image>} [-stages <stagenumber (from 1 to 10)>]',
        value: 'Makes a conspiracy iceberg by filling in random words and images. (only supports static image files)\n' +
            'Example usage: p:iceberg -stage1words Stolen Assets | Deinx -stage1image https://cdn.discordapp.com/attachments/760223418968047629/862409703392149554/c85e3e8144c1012764074e60607c5e56.png -stage10words Vordath is Transexual -stage10image https://cdn.discordapp.com/attachments/760223418968047629/862410091814322216/output.png'
    },
    cooldown: 2500,
    type: 'Memes'
}