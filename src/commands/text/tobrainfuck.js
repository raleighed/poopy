module.exports = {
    name: ['tobrainfuck', 'tobf'],
    args: [{"name":"message","required":true,"specifarg":false,"orig":"<message>"}],
    execute: async function (msg, args) {
        let poopy = this
        let { tobrainfuck, fetchPingPerms } = poopy.functions
        let vars = poopy.vars
        let config = poopy.config
        let { fs, Discord } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        var saidMessage = args.slice(1).join(' ')
        if (args[1] === undefined) {
            await msg.reply('What is the message to convert?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var tobf = tobrainfuck(saidMessage)
        if (!msg.nosend) await msg.reply({
            content: tobf,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(async () => {
            var currentcount = vars.filecount
            vars.filecount++
            var filepath = `temp/${config.database}/file${currentcount}`
            fs.mkdirSync(`${filepath}`)
            fs.writeFileSync(`${filepath}/tobrainfuck.txt`, tobrainfuck(saidMessage))
            await msg.reply({
                files: [new Discord.AttachmentBuilder(`${filepath}/tobrainfuck.txt`)]
            }).catch(() => { })
            fs.rmSync(`${filepath}`, { force: true, recursive: true })
        })
        return tobf
    },
    help: {
        name: 'tobrainfuck/tobf <message>',
        value: 'Converts the message into Brainfuck.'
    },
    cooldown: 2500,
    type: 'Text'
}