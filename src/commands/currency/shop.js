module.exports = {
  name: ['shop'],
  args: [{ "name": "type", "required": true, "specifarg": false, "orig": "<type (upgrades, buffs or items)>", "autocomplete": ['upgrades', 'buffs', 'items'] }],
  execute: async function (msg, args) {
    let poopy = this
    let config = poopy.config
    let bot = poopy.bot
    let { displayShop, fetchPingPerms } = poopy.functions

    let types = ['upgrades', 'buffs', 'items']

    if (!args[1]) {
      var instruction = "**upgrades** - Buy upgrades used for battling against others.\n**buffs** - Purchase useful temporary buffs during battles.\n**items** - Buy some cool or useless items."
      if (!msg.nosend) {
        if (config.textEmbeds) msg.reply({
          content: instruction,
          allowedMentions: {
            parse: fetchPingPerms(msg)
          }
        }).catch(() => { })
        else msg.reply({
          embeds: [{
            "title": "Shop Options",
            "description": instruction,
            "color": 0x472604,
            "footer": {
              "icon_url": bot.user.displayAvatarURL({
                dynamic: true, size: 1024, extension: 'png'
              }),
              "text": bot.user.displayName
            },
          }]
        }).catch(() => { })
      }

      return instruction
    }

    if (!types.includes(args[1].toLowerCase())) {
      await msg.reply('Not a valid category.').catch(() => { })
      return
    }

    return await displayShop(msg.channel, msg.member, msg, args[1].toLowerCase())
  },
  help: {
    name: 'shop <type (upgrades, buffs or items)>',
    value: "Access the shop, and buy battle upgrades, buffs, and other items from it."
  },
  cooldown: 5000,
  type: 'Currency'
}