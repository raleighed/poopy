module.exports = {
    name: ['autocrop'],
    args: [{ "name": "file", "required": false, "specifarg": false, "orig": "{file}" }, { "name": "limit", "required": false, "specifarg": true, "orig": "[-limit <threshold (from 0 to 255)>]" }, { "name": "round", "required": false, "specifarg": true, "orig": "[-round <divisor>]" }, { "name": "invert", "required": false, "specifarg": true, "orig": "[-invert]" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, getOption, parseNumber,
            validateFile, fetchPingPerms, downloadFile,
            execPromise, findpreset, sendFile
        } = poopy.functions
        let { fs } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };

        var limit = getOption(args, 'limit', { dft: 0, func: (opt) => parseNumber(opt, { min: 0, max: 255, round: true, dft: 0 }) })
        var round = getOption(args, 'round', { dft: 1, func: (opt) => parseNumber(opt, { min: 0, round: true, dft: 1 }) })
        var invert = getOption(args, 'invert', { dft: false, n: 0 })

        var currenturl = lastUrl(msg, 0)
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
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`

            var cropstd = await execPromise(`ffmpeg -stream_loop 2 -t 1 -i ${filepath}/${filename} -vframes 3 -vf "${invert ? 'negate,' : ''}cropdetect=${limit}:${round}:0" -f null -`)
            var cropdetect = (cropstd.match(/crop=-?[0-9]+:-?[0-9]+:-?[0-9]+:-?[0-9]+/) ?? [])[0]

            if (!cropdetect) {
                await msg.reply('Couldn\'t find desirable crop params.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a? -filter_complex "[0:v]${cropdetect},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]" -map "[out]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)

            return await sendFile(msg, filepath, `output.mp4`)
        } else if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo            })
            var filename = `input.png`

            var cropstd = await execPromise(`ffmpeg -stream_loop 2 -t 1 -i ${filepath}/${filename} -vframes 3 -vf "${invert ? 'negate,' : ''}cropdetect=${limit}:${round}:0" -f null -`)
            var cropdetect = (cropstd.match(/crop=-?[0-9]+:-?[0-9]+:-?[0-9]+:-?[0-9]+/) ?? [])[0]

            if (!cropdetect) {
                await msg.reply('Couldn\'t find desirable crop params.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]${cropdetect}[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)

            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`

            var cropstd = await execPromise(`ffmpeg -stream_loop 2 -t 1 -i ${filepath}/${filename} -vframes 3 -vf ${invert ? 'negate,' : ''}cropdetect=${limit}:${round}:0 -f null -`)
            var cropdetect = (cropstd.match(/crop=-?[0-9]+:-?[0-9]+:-?[0-9]+:-?[0-9]+/) ?? [])[0]

            if (!cropdetect) {
                await msg.reply('Couldn\'t find desirable crop params.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]${cropdetect},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting ${filepath}/output.gif`)

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
        name: 'autocrop {file} [-limit <threshold (from 0 to 255)>] [-round <divisor>] [-invert]',
        value: 'Autocrops the file by recurring to black borders.'
    },
    cooldown: 2500,
    type: 'Resizing'
}