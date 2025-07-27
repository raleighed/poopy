module.exports = {
  name: ['sayorichoice', 'schoice'],
  args: [{"name":"blueChoice","required":false,"specifarg":false,"orig":"\"{blueChoice}\""},{"name":"redChoice","required":false,"specifarg":false,"orig":"\"{redChoice}\""}],
  execute: async function (msg, args) {
    let poopy = this
    let vars = poopy.vars
    let config = poopy.config
    let { fs, Jimp, Discord } = poopy.modules
    let { sendFile } = poopy.functions

    await msg.channel.sendTyping().catch(() => { })
    var saidMessage = args.slice(1).join(' ').replace(/’/g, '\'')
    vars.symbolreplacements.forEach(symbolReplacement => {
      symbolReplacement.target.forEach(target => {
        saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
      })
    })
    var matchedTextes = saidMessage.match(/"([\s\S]*?)"/g)
    if (!matchedTextes) {
      matchedTextes = ['""', '""']
    } else if (!matchedTextes[1]) {
      matchedTextes[1] = '""'
    }
    var bchoice = matchedTextes[0].substring(1, matchedTextes[0].length - 1)
    var rchoice = matchedTextes[1].substring(1, matchedTextes[1].length - 1)
    var currentcount = vars.filecount
    vars.filecount++
    var filepath = `temp/${config.database}/file${currentcount}`
    fs.mkdirSync(`${filepath}`)
    var sayori = await Jimp.read(`assets/image/sayori.png`)
    var bangers = await Jimp.loadFont('assets/fonts/Bangers/Bangers.fnt')
    await sayori.print(bangers, 52, 35, { text: Discord.Util.cleanContent(bchoice, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 176, 62)
    await sayori.print(bangers, 487, 38, { text: Discord.Util.cleanContent(rchoice, msg), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 228, 72)
    await sayori.writeAsync(`${filepath}/output.png`)
    return await sendFile(msg, filepath, `output.png`)
  },
  help: {
    name: 'sayorichoice/schoice "{blueChoice}" "{redChoice}"',
    value: 'Creates an image with Sayori where you can choose between 2 options.'
  },
  cooldown: 2500,
  type: 'Inside Joke'
}