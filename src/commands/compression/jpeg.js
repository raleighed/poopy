module.exports = {
    name: ['jpeg'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"quality","required":false,"specifarg":true,"orig":"[-quality <percentage>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let { fs } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var quality = 1
        var qualityindex = args.indexOf('-quality')
        if (qualityindex > -1) {
            quality = isNaN(Number(args[qualityindex + 1])) ? 1 : Number(args[qualityindex + 1]) <= 1 ? 1 : Number(args[qualityindex + 1]) >= 100 ? 100 : Math.round(Number(args[qualityindex + 1])) ?? 1
        }
        var currenturl = lastUrl(msg, 0) || args[1]
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

        if (type.mime.startsWith('video')) {
            if (fileinfo.info.width > 1000 || fileinfo.info.height > 1000) {
                await msg.reply(`That file has width or height higher than 1000 pixels, time to blow.`).catch(() => { })
                fs.rmSync(filepath, { force: true, recursive: true })
                return
            }

            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var fps = fileinfo.info.fps.includes('0/0') ? '50' : fileinfo.info.fps
            fs.mkdirSync(`${filepath}/frames`)
            await execPromise(`magick ${filepath}/${filename} -coalesce -quality ${quality} ${filepath}/frames/frame_%d.jpg`)
            await execPromise(`ffmpeg -r ${fps} -i ${filepath}/frames/frame_%d.jpg -i ${filepath}/${filename} -map 1:a? -b:a 10k -filter_complex "[0:v]scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`
            await execPromise(`magick ${filepath}/${filename} -quality ${quality} ${filepath}/output.jpg`)
            return await sendFile(msg, filepath, `output.jpg`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            var fps = fileinfo.info.fps.includes('0/0') ? '50' : fileinfo.info.fps
            fs.mkdirSync(`${filepath}/frames`)
            fs.mkdirSync(`${filepath}/mframes`)
            await execPromise(`magick ${filepath}/${filename} -coalesce -quality ${quality} ${filepath}/frames/frame_%d.jpg`)
            await execPromise(`ffmpeg -r ${fps} -i ${filepath}/frames/frame_%d.jpg -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -vsync 0 -gifflags -offsetting ${filepath}/output.gif`)
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
        name: 'jpeg/needsmorejpeg {file} [-quality <percentage>]',
        value: "Adds JPEG artifacts to the file."
    },
    cooldown: 2500,
    type: 'Compression'
}