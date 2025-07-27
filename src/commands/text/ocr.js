module.exports = {
    name: ['ocr', 'recognizetext'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let { lastUrl, validateFile, userToken, fetchPingPerms } = poopy.functions
        let { axios, fs, Discord } = poopy.modules
        let vars = poopy.vars
        let config = poopy.config

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file to recognize?!').catch(() => { })
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

        if (type.mime.startsWith('image')) {
            var options = {
                method: 'POST',
                url: 'https://microsoft-computer-vision3.p.rapidapi.com/ocr',
                params: { detectOrientation: 'true', language: 'unk' },
                headers: {
                    'content-type': 'application/json',
                    'x-rapidapi-host': 'microsoft-computer-vision3.p.rapidapi.com',
                    'x-rapidapi-key': userToken(msg.author.id, 'RAPIDAPI_KEY')
                },
                data: {
                    url: currenturl
                }
            }

            var response = await axios(options).catch(async () => {
                await msg.reply('Error.').catch(() => { })
            })

            if (!response) return

            var body = response.data
            var regions = body.regions

            if (regions.length <= 0) {
                await msg.reply(`No text detected.`).catch(() => { })
                return
            }

            var result = regions.map(region => region.lines.map(line => line.words.map(word => word.text).join(' ')).join('\n')).join('\n\n')

            if (!msg.nosend) await msg.reply({
                content: `Language: \`${body.language}\`\n\`\`\`\n${result}\n\`\`\``,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(async () => {
                var currentcount = vars.filecount
                vars.filecount++
                var filepath = `temp/${config.database}/file${currentcount}`
                fs.mkdirSync(`${filepath}`)
                fs.writeFileSync(`${filepath}/ocr.txt`, result)
                await msg.reply({
                    content: `Language: \`${body.language}\``,
                    files: [new Discord.AttachmentBuilder(`${filepath}/ocr.txt`)]
                }).catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
            })
            return `Language: \`${body.language}\`\n\`\`\`\n${result}\n\`\`\``
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
        name: 'ocr/recognizetext {file}',
        value: "Recognizes text within an image with Microsoft's Computer Vision."
    },
    cooldown: 2500,
    type: 'Text',
    envRequired: ['RAPIDAPI_KEY']
}