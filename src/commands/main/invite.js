module.exports = {
  name: ['invite'],
  args: [],
  execute: async function (msg) {
    let poopy = this
    let bot = poopy.bot

    await msg.channel.sendTyping().catch(() => { })
    var invite = `Wanna invite this bot? [Click here.](<https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot%20applications.commands&permissions=275415166152>)`
      + (process.env.BOT_WEBSITE ? `\nWanna find out more about it? [Check out the website.](${process.env.BOT_WEBSITE})` : "")

    if (!msg.nosend) await msg.reply(invite).catch(() => { })
    return invite
  },
  help: {
    name: 'invite',
    value: "Sends Poopy's invite and Discord server links."
  },
  cooldown: 2500,
  type: 'Main'
}