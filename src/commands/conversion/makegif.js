module.exports = {
    name: ['makegif'],
    args: [{"name":"frameurls","required":false,"specifarg":false,"orig":"<frames>"},{"name":"frame","required":false,"specifarg":true,"orig":"[-frames <framenumber (max 100)>]"},{"name":"fps","required":false,"specifarg":false,"orig":"{fps (max 50)}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrls, getUrls, validateFile, fetchPingPerms,
            execPromise, findpreset, sendFile
        } = poopy.functions
        let vars = poopy.vars
        let config = poopy.config
        let { fs, Jimp } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (args[1] === undefined && msg.attachments.size <= 0 && !(lastUrls(msg).length)) {
            await msg.reply('What are the frames?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };

        var fpsIsLastArg = false
        if (!isNaN(Number(args[args.length - 1])) && args[args.length - 2] !== '-frames') {
            fpsIsLastArg = true
        }
        var fps = !fpsIsLastArg ? 50 : Number(args[args.length - 1]) >= 50 ? 50 : Number(args[args.length - 1]) <= 0 ? 0 : Number(args[args.length - 1]) ?? 50

        var framenumber = 50
        var framesindex = args.indexOf('-frames')
        if (framesindex > -1) {
            framenumber = isNaN(Number(args[framesindex + 1])) ? 50 : Number(args[framesindex + 1]) <= 1 ? 1 : Number(args[framesindex + 1]) >= 100 ? 100 : Math.round(Number(args[framesindex + 1])) || 50
            args.splice(framesindex, 2)
        }

        var lasturlserror = ''

        var frameurls = {}
        var filetypes = {}
        var infos = {}

        var fetched = await getUrls(msg, { tempdir: true, string: msg.content }).catch(() => { }) ?? []
        var nofiles = false
        if (fetched.length <= 0) nofiles = true

        if (nofiles) {
            var validfilecount = 0
            var framemessage = await msg.reply(`Found 0 images.`).catch(() => { })

            var frameeditinterval = setInterval(() => {
                if (framemessage) framemessage.edit(`Found ${validfilecount} images.`).catch(() => { })
            }, 5000)

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
                    lasturlserror = `Unsupported file: \`${url}\``
                    return false
                }
                frameurls[validfilecount + 1] = url
                filetypes[validfilecount + 1] = filetype
                infos[validfilecount + 1] = fileinfo
                nofiles = false
                return true
            }

            var lasturls = lastUrls(msg, true)

            for (var i in lasturls) {
                var url = lasturls[i]
                var success = await inspect(url).catch(() => { })
                if (success) validfilecount += 1
                if (validfilecount >= framenumber) break
            }
            
            clearInterval(frameeditinterval)
            if (framemessage) framemessage.delete().catch(() => { })
        } else {
            for (var i in fetched) frameurls[Number(i) + 1] = fetched[i]
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

        for (var i in frameurls) {
            if (!filetypes[i] || !infos[i]) {
                var error
                var imageurl = frameurls[i]
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
                filetypes[i] = filetype
                infos[i] = fileinfo
            }
        }

        var currentcount = vars.filecount
        vars.filecount++
        var filepath = `temp/${config.database}/file${currentcount}`

        fs.mkdirSync(`${filepath}`)
        fs.mkdirSync(`${filepath}/frames`)
        var framesizes
        for (var i in frameurls) {
            var frameurl = frameurls[i]
            if (!framesizes) {
                framesizes = { x: infos[i].info.width, y: infos[i].info.height }
            }

            var image = await Jimp.read(frameurl)
            image.resize(framesizes.x, framesizes.y)
            await image.writeAsync(`${filepath}/frames/${i.padStart(3, '0')}.png`)
        }

        await execPromise(`ffmpeg -r ${fps} -i ${filepath}/frames/%03d.png -filter_complex "[0:v]scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[gif][pgif];[pgif]palettegen=reserve_transparent=1[palette];[gif][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -vsync 0 -gifflags -offsetting ${filepath}/output.gif`)
        return await sendFile(msg, filepath, `output.gif`)
    },
    help: {
        name: 'makegif <frameurls> [-frames <framenumber (max 100)> {fps (max 50)}',
        value: 'Makes a GIF out of the frames and FPS specified.'
    },
    cooldown: 2500,
    type: 'Conversion'
}