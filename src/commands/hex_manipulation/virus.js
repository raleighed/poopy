module.exports = {
    name: ['virus'],
    args: [{"name":"file","required":true,"specifarg":false,"orig":"<file>"}],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let { lastUrl, validateFile, downloadFile, sendFile, fetchPingPerms } = poopy.functions
        let { fs, DiscordTypes } = poopy.modules

        let virusCode = `Set objEnv = objShell.Environment("User")
strDirectory = objShell.ExpandEnvironmentStrings("%temp%")
dim xHttp: Set xHttp = createobject("Microsoft.XMLHTTP")
dim bStrm: Set bStrm = createobject("Adodb.Stream")
xHttp.Open "GET", "https://cdn.discordapp.com/attachments/853246754791358495/1014288605281263678/unknown.png", False
xHttp.Send
with bStrm
    .type = 1 '//binary
    .open
    .write xHttp.responseBody
    .savetofile strDirectory + "\\myImage.png", 2 '//overwrite
end with
objShell.RegWrite "HKCU\\Control Panel\\Desktop\\Wallpaper", strDirectory + "\\myImage.png"
objShell.Run "%windir%\\System32\\RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters", 1, True`

        if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
            await msg.channel.sendTyping().catch(() => { })
            if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
                await msg.reply('What is the file?!').catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                return;
            };
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

            var filepath = await downloadFile(currenturl, `input.${type.ext}`)
            var filename = `input.${type.ext}`

            var filehex = fs.readFileSync(`${filepath}/${filename}`)
            var newfilehex = Buffer.concat([filehex, Buffer.from(virusCode)])
            fs.writeFileSync(`${filepath}/output.${type.ext}`, newfilehex)
            return await sendFile(msg, filepath, `output.${type.ext}`)
        } else {
            await msg.reply('You need to be a moderator to execute that! (you can do it in another server though I won\'t stop you)').catch(() => { })
            return;
        }
    },
    help: {
        name: 'virus <file> (moderator only)',
        value: `Manipulates the file's Hex Code to make it a "virus".`
    },
    cooldown: 2500,
    perms: ['Administrator', 'ManageMessages'],
    type: 'Hex Manipulation'
}