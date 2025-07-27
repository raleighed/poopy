module.exports = {
    name: ['multlength', 'multduration'],
    args: [{"name":"multiplier","required":false,"specifarg":false,"orig":"[multiplier (from 1 to 6)]"},{"name":"file","required":false,"specifarg":false,"orig":"{file}"}],
    execute: async function (msg, args) {
        let poopy = this
        let { lastUrl, validateFile, downloadFile, sendFile, fetchPingPerms } = poopy.functions
        let { fs } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]
        var speed = isNaN(Number(args[1])) ? 2 : Number(args[1]) <= 1 ? 1 : Number(args[1]) >= 6 ? 6 : Number(args[1]) || 2
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
            var videohex = fs.readFileSync(`${filepath}/${filename}`)
            var mvhdindex = videohex.indexOf('mvhd')
            var subarray1 = videohex.subarray(0, mvhdindex + 20)
            var doublehex = (Number('0x' + videohex.toString('hex').substring((mvhdindex + 20) * speed, (mvhdindex + 24) * speed)) * speed).toString(16).padStart(8, '0')
            var doublelength = Buffer.from(doublehex.substring(doublehex.length - 8, doublehex.length), 'hex')
            var subarray2 = videohex.subarray(subarray1.length + doublelength.length, videohex.length)
            var newvideohex = Buffer.concat([subarray1, doublelength, subarray2])
            fs.writeFileSync(`${filepath}/output.mp4`, newvideohex)
            return await sendFile(msg, filepath, `output.mp4`)
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
        name: 'multlength/multduration [multiplier (from 1 to 6)] {file}',
        value: "Manipulates the video's Hex Code to multiply its duration."
    },
    cooldown: 2500,
    type: 'Hex Manipulation'
}
