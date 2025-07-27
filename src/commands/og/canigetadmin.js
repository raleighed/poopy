module.exports = {
  name: ['canigetadmin'],
  args: [],
  execute: async function (msg) {
    let poopy = this
    let { sendFile } = poopy.functions
    let { Discord } = poopy.modules

    await msg.channel.sendTyping().catch(() => { })
    var attachment = new Discord.AttachmentBuilder('assets/video/no.mp4')
    if (msg.nosend) return await sendFile(msg, 'assets/video', 'no.mp4', { keep: true })
    await msg.reply({
      files: [attachment]
    }).catch(() => { })
  },
  help: { name: 'canigetadmin', value: 'Yo can I get admin? 😂' },
  cooldown: 2500,
  type: 'OG'
}