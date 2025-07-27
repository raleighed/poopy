module.exports = {
  name: ['brainfuck', 'bf'],
  args: [{ "name": "code", "required": true, "specifarg": false, "orig": "<code>" }],
  execute: async function (msg, args) {
    let poopy = this
    let { brainfuck, fetchPingPerms } = poopy.functions

    await msg.channel.sendTyping().catch(() => { })
    var saidMessage = args.slice(1).join(' ')
    if (args[1] === undefined) {
      await msg.reply('What is the code to compile?!').catch(() => { })
      await msg.channel.sendTyping().catch(() => { })
      return;
    };
    var compiled = await brainfuck(saidMessage)
    if (!msg.nosend) await msg.reply({
      content: compiled || '​',
      allowedMentions: {
        parse: fetchPingPerms(msg)
      }
    }).catch(() => { })
    return compiled || '​'
  },
  help: {
    name: 'brainfuck/bf <code>',
    value: 'Compiles the Brainfuck code supplied.'
  },
  cooldown: 2500,
  type: 'Text'
}