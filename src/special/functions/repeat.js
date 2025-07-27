module.exports = {
  helpf: '(phrase | times | separator)',
  desc: "Repeats the phrase by the times specified. If the separator is specified, it'll separate each repetition with the separator.",
  func: function (matches, msg, _, _, opts) {
    let poopy = this
    let { splitKeyFunc } = poopy.functions
    let tempdata = poopy.tempdata
    let config = poopy.config

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 3 })
    var phrase = split[0] ?? ''
    var times = Math.min(Number(split[1] ?? ''), 100)
    var separator = split[2] ?? ''
    var repeat = []
    for (var i = 0; i < times; i++) {
      repeat.push(phrase)
      tempdata[msg.author.id][msg.id].keyattempts++
      if (!opts.ownermode && tempdata[msg.author.id][msg.id].keyattempts >= config.keyLimit) break
    }
    return repeat.join(separator)
  },
  limit: 5
}