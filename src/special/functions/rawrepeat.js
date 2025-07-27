module.exports = {
  helpf: '(phrase | times | separator)',
  desc: "Repeats the phrase by the times specified, but keywords and functions don't execute automatically. If the separator is specified, it'll separate each repetition with the separator.",
  func: async function (matches, msg, isBot, _, opts) {
    let poopy = this
    let { splitKeyFunc, getKeywordsFor, sleep } = poopy.functions
    let tempdata = poopy.tempdata
    let config = poopy.config

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 3 })
    var phrase = split[0] ?? ''
    var times = Math.min(Number(await getKeywordsFor(split[1] ?? '', msg, isBot, opts).catch(() => { })), 100)
    var separator = await getKeywordsFor(split[2] ?? '', msg, isBot, opts).catch(() => { }) ?? ''
    var repeat = []
    for (var i = 0; i < times; i++) {
      repeat.push(await getKeywordsFor(phrase, msg, isBot, opts).catch(() => { }) ?? '')
      await sleep()
      tempdata[msg.author.id][msg.id].keyattempts++
      if (!opts.ownermode && tempdata[msg.author.id][msg.id].keyattempts >= config.keyLimit) break
    }
    return repeat.join(separator)
  },
  raw: true,
  limit: 5
}