module.exports = {
  name: ['shutup'],
  args: [{"name":"duration","required":false,"specifarg":false,"orig":"[duration (max 600 (10 minutes))]"}],
  execute: async function (msg, args) {
    let poopy = this
    let config = poopy.config
    let tempdata = poopy.tempdata
    let { sleep } = poopy.functions
    let { DiscordTypes } = poopy.modules

    if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
      if (tempdata[msg.guild.id][msg.channel.id].shut) return

      var duration = isNaN(Number(args[1])) ? 10 : Number(args[1]) >= 600 ? 600 : Number(args[1]) ?? 10

      if (!msg.nosend) await msg.reply('i shit up').catch(() => { })
      tempdata[msg.guild.id][msg.channel.id].shut = true
      await sleep(duration * 1000)
      tempdata[msg.guild.id][msg.channel.id].shut = false
      if (!msg.nosend) await msg.reply('i came back').catch(() => { })
      return `i shit up ${duration}`
    } else {
      await msg.reply('You need to be a moderator to execute that!').catch(() => { })
      return
    }
  },
  help: {
    name: 'shutup [duration (max 600 (10 minutes))] (moderator only)',
    value: 'he shuts up'
  },
  perms: ['Administrator', 'ManageMessages'],
  type: 'Main',
  hivemindForce: true
}