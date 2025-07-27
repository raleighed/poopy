module.exports = {
    name: ['lossygif'],
    args: [{"name":"gif","required":true,"specifarg":false,"orig":"<gif>"},{"name":"lossy","required":false,"specifarg":true,"orig":"[-lossy <number (from 30 to 200)>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile,
            fetchPingPerms, execPromise, sendFile
        } = poopy.functions
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var lossy = 80
        var lossyindex = args.indexOf('-lossy')
        if (lossyindex > -1) {
            lossy = isNaN(Number(args[lossyindex + 1])) ? 80 : Number(args[lossyindex + 1]) <= 30 ? 30 : Number(args[lossyindex + 1]) >= 200 ? 200 : Math.round(Number(args[lossyindex + 1])) || 80
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

        if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            var filepath = await downloadFile(currenturl, `input.gif`, {
                fileinfo            })
            var filename = `input.gif`
            await execPromise(`gifsicle -O3 --lossy=${lossy} -o ${filepath}/output.gif ${filepath}/${filename}`)
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
        name: 'lossygif <gif> [-lossy <number (from 30 to 200)>]',
        value: 'Lowers the size of a GIF by using lossy LZW compression.'
    },
    cooldown: 2500,
    type: 'Compression'
}