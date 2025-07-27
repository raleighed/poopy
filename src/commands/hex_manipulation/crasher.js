module.exports = {
    name: ['crasher', 'crashvideo'],
    args: [{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes, fs } = poopy.modules

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
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

            if (type.mime.startsWith('image') || type.mime.startsWith('video')) {
                var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                    fileinfo                })
                var filename = `input.${fileinfo.shortext}`
                fs.copyFileSync(`assets/video/crash.webm`, `${filepath}/crash.webm`)

                await execPromise(`ffmpeg -i ${filepath}/${filename} -pix_fmt yuv444p -preset ${findpreset(args)} ${filepath}/webm.webm`)
                fs.writeFileSync(`${filepath}/concat.txt`, `file 'webm.webm'\nfile 'crash.webm'`)
                await execPromise(`ffmpeg -f concat -i ${filepath}/concat.txt -codec copy -preset ${findpreset(args)} ${filepath}/output.webm`)
                return await sendFile(msg, filepath, `output.webm`)
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
        } else {
            await msg.reply('You need to be a moderator to execute that! (you can do it in another server though I won\'t stop you)').catch(() => { })
            return;
        }
    },
    help: {
        name: 'crasher/crashvideo {file} (moderator only)',
        value: "Manipulates the file to make it a WebM crasher."
    },
    cooldown: 2500,
    perms: ['Administrator', 'ManageMessages'],
    type: 'Hex Manipulation'
}
