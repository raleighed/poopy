module.exports = {
  name: ['poopymode', 'hivemindmode'],
  args: [{ "name": "state", "required": false, "specifarg": false, "orig": "[state]" }],
  execute: async function (msg, args) {
    let poopy = this
    let config = poopy.config
    let data = poopy.data
    let { getTotalHivemindStatus } = poopy.functions
    let { DiscordTypes } = poopy.modules

    var hivemindState = data.guildData[msg.guild.id].poopymode
    var hivemindStatus = await getTotalHivemindStatus()

    var acceptableOnKeywords = ['all', 'everyone', 'everybody', 'true', 't', '1', 'on', 'enable', 'yes', 'y', '+']
    var acceptableOffKeywords = ['one', '1', 'single', 'false', 'f', '0', 'off', 'disable', 'no', 'n', '-']
    var newState = args[1] !== undefined ? (acceptableOnKeywords.includes(args[1].toLowerCase()) ? true : acceptableOffKeywords.includes(args[1].toLowerCase()) ? false : undefined) : undefined

    if (newState === undefined) {
      var text = `Hivemind Mode is set to **${hivemindState ? "all" : "one"}**. There are a total of **${hivemindStatus.length}** poopies in the hivemind.`
      if (!msg.nosend) await msg.reply(text).catch(() => { })
      return text
    } else {
      if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
        data.guildData[msg.guild.id].poopymode = newState
        if (data.guildData[msg.guild.id].poopymode) {
          var text = `Using the power of **all poopies in the hivemind** now, which is **${hivemindStatus.length}**.`
          if (!msg.nosend) await msg.reply(text).catch(() => { })
          return text
        } else {
          var text = `Using the power of **only one poopy in the hivemind** now. Total poopies is **${hivemindStatus.length}**.`
          if (!msg.nosend) await msg.reply(text).catch(() => { })
          return text
        }
      } else {
        await msg.reply('You need to be a moderator to execute that!').catch(() => { })
        return;
      };
    }
  },
  help: {
    name: 'poopymode/hivemindmode [state (all or one)] (moderator only)',
    value: "Toggle between having just 1 bot respond to your messages or all of the ones available."
  },
  cooldown: 5000,
  perms: ['Administrator'],
  type: 'Settings',
  envRequired: ['HIVEMIND_ID'],
  configRequired: ['hivemind'],
  hivemindForce: true
}