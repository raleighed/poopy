module.exports = {
    name: ['opacity'],
    args: [{ "name": "alpha", "required": false, "specifarg": false, "orig": "{alpha (from 0 to 255)}" }, { "name": "image", "required": true, "specifarg": false, "orig": "<image>" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[2] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0)
        var opacity = isNaN(Number(args[1])) ? 0 : Number(args[1]) <= 0 ? 0 : Number(args[1]) >= 255 ? 255 : Math.round(Number(args[1])) || 0
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
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo
            })
            var filename = `input.png`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -filter_complex "[0:v]geq=r='r(X,Y)':a='${opacity / 255}*alpha(X,Y)'[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else if (type.mime.startsWith('video') || type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            await msg.reply(`you can go to montenegro`).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
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
        name: 'opacity {alpha (from 0 to 255)} <image>',
        value: "Sets the image's opacity to the alpha specified."
    },
    cooldown: 2500,
    type: 'Color'
}