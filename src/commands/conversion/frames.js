module.exports = {
    name: ['frames', 'extractframes', 'getframes'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, fetchPingPerms,
            execPromise, navigateEmbed, sendFile
        } = poopy.functions
        let vars = poopy.vars
        let { fs, archiver, DiscordTypes } = poopy.modules
        let config = poopy.config
        let bot = poopy.bot

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

        if (type.mime.startsWith('video') || (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            fs.mkdirSync(`${filepath}/frames`)

            await execPromise(`ffmpeg -i ${filepath}/${filename} ${filepath}/frames/frame_%04d.png`)
            var output = fs.createWriteStream(`${filepath}/output.zip`)
            var archive = archiver('zip')

            return await new Promise(async resolve => {
                output.on('finish', async () => {
                    var frames = fs.readdirSync(`${filepath}/frames`)
                    var catboxframes = {}
    
                    if (msg.nosend) {
                        resolve(await sendFile(msg, filepath, `output.zip`))
                        return
                    }

                    await navigateEmbed(msg.channel, async (page, ended) => {
                        var frameurl = ended ? await vars.Catbox.upload(`${filepath}/frames/${frames[page - 1]}`).catch(() => { }) : catboxframes[frames[page - 1]]
    
                        if (!frameurl && !ended) {
                            frameurl = await vars.Litterbox.upload(`${filepath}/frames/${frames[page - 1]}`).catch(() => { }) ?? ''
                            catboxframes[frames[page - 1]] = frameurl
                        }
    
                        if (config.textEmbeds) return `${frameurl}\n\nFrame ${page}/${frames.length}`
                        else return {
                            "title": fileinfo.name,
                            "url": currenturl,
                            "color": 0x472604,
                            "image": {
                                "url": frameurl
                            },
                            "footer": {
                                "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                                "text": `Frame ${page}/${frames.length}`
                            },
                        }
                    }, frames.length, msg.member, [
                        {
                            emoji: '939523064658526278',
                            reactemoji: '⏬',
                            customid: 'zip',
                            style: DiscordTypes.ButtonStyle.Primary,
                            function: async (_, __, resultsMsg, collector) => {
                                collector.stop()
                                resultsMsg.delete().catch(() => { })
                                sendFile(msg, filepath, `output.zip`)
                            },
                            page: false
                        }
                    ], undefined, undefined, undefined, (reason) => {
                        if (reason == 'time') fs.rmSync(filepath, { force: true, recursive: true })
                    }, msg)
                    resolve(catboxframes[frames[0]])
                });
    
                archive.pipe(output)
                archive.directory(`${filepath}/frames`, false)
                archive.finalize()
            })
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
        name: 'frames/extractframes/getframes {file}',
        value: 'Extracts all of the frames in the video/GIF and archives them in a ZIP file.'
    },
    cooldown: 2500,
    type: 'Conversion'
}