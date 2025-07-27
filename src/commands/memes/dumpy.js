module.exports = {
    name: ['dumpy', 'twerkmosaic', 'amongmosaic', 'crewmatemosaic'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"},{"name":"resolution","required":false,"specifarg":true,"orig":"[-resolution <number>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile,
            fetchPingPerms, execPromise, sendFile
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var resolution = 25
        var resolutionindex = args.indexOf('-resolution')
        if (resolutionindex > -1) {
            resolution = isNaN(Number(args[resolutionindex + 1])) ? 25 : Number(args[resolutionindex + 1]) <= 1 ? 1 : Number(args[resolutionindex + 1]) >= 40 ? 40 : Math.floor(Number(args[resolutionindex + 1])) || 25
        }
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
            var filepath = await downloadFile(currenturl, 'input.png')
            var filename = 'input.png'
            fs.copyFileSync(`lib/dumpy.jar`, `${filepath}/dumpy.jar`)

            await execPromise(`cd ${filepath} && java -jar dumpy.jar --file ${filename} --lines ${resolution}`)

            try {
                fs.renameSync(`${filepath}/dumpy.gif`, `${filepath}/output.gif`)
            } catch (_) {
                await msg.reply('Couldn\'t send file.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }
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
        name: 'dumpy/twerkmosaic/amongmosaic/crewmatemosaic {file} [-resolution <number>]',
        value: 'Fun Fact: poopy has 3 among us related commands'
    },
    cooldown: 2500,
    type: 'Memes'
}