module.exports = {
  name: ['stroke', 'gibberish'],
  args: [{ "name": "message", "required": true, "specifarg": false, "orig": "<message>" }],
  execute: async function (msg, args) {
    let poopy = this
    let { gibberish, fetchPingPerms } = poopy.functions

    await msg.channel.sendTyping().catch(() => { })
    var saidMessage = args.slice(1).join(' ')
    if (args[1] === undefined) {
      await msg.reply('What is the message?!').catch(() => { })
      await msg.channel.sendTyping().catch(() => { })
      return;
    };
    var gibber = gibberish(saidMessage)
    if (!msg.nosend) await msg.reply({
      content: gibber,
      allowedMentions: {
        parse: fetchPingPerms(msg)
      }
    }).catch(() => { })
    return gibber
  },
  help: {
    name: 'stroke/gibberish <message>',
    value: 'teral stroket  kknerhxtiarhxtlo k'
  },
  cooldown: 2500,
  type: 'Text'
}