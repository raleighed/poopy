module.exports = {
    name: ['shazam', 'identifysong', 'getsong'],
    args: [{ "name": "file", "required": false, "specifarg": false, "orig": "{file}" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, fetchPingPerms,
            execPromise, findpreset, userToken, request
        } = poopy.functions
        let { fs } = poopy.modules
        let config = poopy.config

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

        if (type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.mp4`, {
                fileinfo            })
            var filename = `input.mp4`
            var audio = fileinfo.info.audio

            if (audio) {
                await execPromise(`ffmpeg -i ${filepath}/${filename} -map 0:a -preset ${findpreset(args)} ${filepath}/input.mp3`)

                var options = {
                    method: 'POST',
                    url: 'https://shazam-song-recognizer.p.rapidapi.com/recognize',
                    headers: {
                        'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
                        'X-RapidAPI-Host': 'shazam-song-recognizer.p.rapidapi.com',
                        'X-RapidAPI-Key': userToken(msg.author.id, 'RAPIDAPI_KEY'),
                        useQueryString: true
                    },
                    formData: {
                        upload_file: {
                            value: fs.readFileSync(`${filepath}/input.mp3`),
                            options: { filename: 'input.mp3', contentType: 'application/octet-stream' }
                        }
                    }
                }
    
                var response = await request(options).catch(async () => {
                    await msg.reply('Error identifying song.').catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                })
    
                if (!response) return
    
                if (!(response.status >= 200 && response.status < 300)) {
                    await msg.reply(`${response.status} ${response.statusText}`).catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                    return
                }

                var result = response.data.result

                if (!result) {
                    await msg.reply("Couldn't identify song.").catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                    return
                }

                var payload = {
                    content: `**${result.title} - ${result.subtitle}** (<${result.url}>)\n\n**Genre**: ${result.genres.primary}\n\n${result.images.background}`,
                    embeds: [{
                        title: `${result.title} - ${result.subtitle}`,
                        url: result.url,
                        description: `**Genre**: ${result.genres.primary}`,
                        color: 0x472604,
                        image: {
                            url: result.images.background
                        }
                    }],
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }

                if (config.textEmbeds) delete payload.embeds
                else delete payload.content

                if (!msg.nosend) await msg.reply(payload).catch(() => { })
                fs.rm(`${filepath}`, { force: true, recursive: true })
                return `**${result.title} - ${result.subtitle}** (<${result.url}>)\n\n**Genre**: ${result.genres.primary}\n\n${result.images.background}`
            } else {
                await msg.reply('No audio stream detected.').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
            }
        } else if (type.mime.startsWith('audio')) {
            var filepath = await downloadFile(currenturl, `input.mp3`, {
                fileinfo            })
            var filename = `input.mp3`

            var options = {
                method: 'POST',
                url: 'https://shazam-song-recognizer.p.rapidapi.com/recognize',
                headers: {
                    'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
                    'X-RapidAPI-Host': 'shazam-song-recognizer.p.rapidapi.com',
                    'X-RapidAPI-Key': userToken(msg.author.id, 'RAPIDAPI_KEY'),
                    useQueryString: true
                },
                formData: {
                    upload_file: {
                        value: fs.readFileSync(`${filepath}/input.mp3`),
                        options: { filename: 'input.mp3', contentType: 'application/octet-stream' }
                    }
                }
            }

            var response = await request(options).catch(async () => {
                await msg.reply('Error identifying song.').catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
            })

            if (!response) return

            if (!(response.status >= 200 && response.status < 300)) {
                await msg.reply(`${response.status} ${response.statusText}`).catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            var result = response.data.result

            if (!result) {
                await msg.reply("Couldn't identify song.").catch(() => { })
                fs.rmSync(`${filepath}`, { force: true, recursive: true })
                return
            }

            var payload = {
                content: `**${result.title} - ${result.subtitle}** (<${result.url}>)\n\n**Genre**: ${result.genres.primary}\n\n${result.images.background}`,
                embeds: [{
                    title: `${result.title} - ${result.subtitle}`,
                    url: result.url,
                    description: `**Genre**: ${result.genres.primary}`,
                    color: 0x472604,
                    image: {
                        url: result.images.background
                    }
                }],
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }

            if (config.textEmbeds) delete payload.embeds
            else delete payload.content

            if (!msg.nosend) await msg.reply(payload).catch(() => { })
            fs.rm(`${filepath}`, { force: true, recursive: true })
            return `**${result.title} - ${result.subtitle}** (<${result.url}>)\n\n**Genre**: ${result.genres.primary}\n\n${result.images.background}`
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
        name: 'shazam/identifysong/getsong {file}',
        value: 'Identifies the song in the file with Shazam. You may need to trim it.'
    },
    cooldown: 2500,
    type: 'Fetching',
    envRequired: ['RAPIDAPI_KEY']
}