module.exports = {
    name: ['tremolo'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"frequency","required":false,"specifarg":true,"orig":"[-frequency <hz (from 0.1 to 20000)>]"},{"name":"depth","required":false,"specifarg":true,"orig":"[-depth <percentage>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var frequency = 5
        var frequencyindex = args.indexOf('-frequency')
        if (frequencyindex > -1) {
            frequency = isNaN(Number(args[frequencyindex + 1])) ? 5 : Number(args[frequencyindex + 1]) <= 0.1 ? 0.1 : Number(args[frequencyindex + 1]) >= 20000 ? 20000 : Number(args[frequencyindex + 1]) || 5
        }
        var depth = 50
        var depthindex = args.indexOf('-depth')
        if (depthindex > -1) {
            depth = isNaN(Number(args[depthindex + 1])) ? 50 : Number(args[depthindex + 1]) <= 0 ? 0 : Number(args[depthindex + 1]) >= 100 ? 100 : Number(args[depthindex + 1]) || 50
        }
        var currenturl = lastUrl(msg, 0)
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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var audio = fileinfo.info.audio

            if (audio) {
                await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]scale=ceil(iw/2)*2:ceil(ih/2)*2[v];[0:a]tremolo=f=${frequency}:d=${depth / 100}[a]" -map "[v]" -map "[a]" -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            } else {
                await msg.reply('No audio stream detected.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
            }
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:a]tremolo=f=${frequency}:d=${depth / 100}[a]" -map "[a]" -preset ${findpreset(args)} ${filepath}/output.mp3`)
            return await sendFile(msg, filepath, `output.mp3`)
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
        name: 'tremolo {file} [-frequency <hz (from 0.1 to 20000)>] [-depth <percentage>]',
        value: "Adds a tremolo effect to the file's audio. Default frequency is 5 and depth is 50."
    },
    cooldown: 2500,
    type: 'Audio'
}