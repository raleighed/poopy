module.exports = {
    name: ['poopallover'],
    args: [{ "name": "subject", "required": true, "specifarg": false, "orig": "<subject>" }],
    execute: async function (msg, args) {
        let poopy = this
        let { Discord } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })
        var saidMessage = args.slice(1).join(' ')
        var attachments = []
        msg.attachments.forEach(attachment => {
            attachments.push(new Discord.AttachmentBuilder(attachment.url))
        });
        if (args[1] === undefined && attachments.length <= 0) {
            await msg.reply('What/who is the subject?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        if (!msg.nosend) await msg.reply({
            content: '**' + (saidMessage || 'this') + '** has been successfully pooped on.',
            allowedMentions: {
                parse: fetchPingPerms(msg)
            },
            files: attachments
        }).catch(() => { })
        return '**' + (saidMessage || 'this') + '** has been successfully pooped on.'
    },
    help: { name: 'poopallover <subject>', value: 'Poop on something.' },
    type: 'OG'
}