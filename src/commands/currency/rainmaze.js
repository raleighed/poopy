module.exports = {
  name: ['rainmaze', 'tilemaze'],
  args: [
    { "name": "w", "required": false, "specifarg": false, "orig": "[w (max 27)]" },
    { "name": "h", "required": false, "specifarg": false, "orig": "[h (max 7)]" }
  ],
  execute: async function (msg, args) {
    let poopy = this
    let { rainmaze, getIndexOption, parseNumber } = poopy.functions
    let { Rainmaze } = poopy.modules

    var w = parseNumber(getIndexOption(args, 1, { dft: [8] })[0], { min: 2, max: 27, dft: 8, round: true })
    var h = parseNumber(getIndexOption(args, 2, { dft: [6] })[0], { min: 1, max: 7, dft: 6, round: true })

    await msg.channel.sendTyping().catch(() => { })
    if (msg.nosend) return new Rainmaze(w, h).draw().description

    var rainstring = await rainmaze(msg.channel, msg.member, msg, w, h).catch((e) => console.log(e))
    return rainstring
  },
  help: {
    name: 'rainmaze/tilemaze [w (max 27)] [h (max 7)]',
    value: "Play Undertale's tile puzzle minigame!"
  },
  cooldown: 5000,
  type: 'Currency'
}