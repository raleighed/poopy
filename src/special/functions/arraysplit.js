module.exports = {
  helpf: '(arrayName | separator | phrase)',
  desc: `Creates a new array by splitting the phrase by the separator. If it already exists, it'll be replaced.`,
  func: function (matches, msg, _, string) {
    let poopy = this
    let { splitKeyFunc, regexClean } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 3 })
    var name = split[0] ?? ''
    var separator = split[1] ?? '|'
    var phr = split[2] ?? ''
    var fullword = `${matches[0]}(${matches[1]})`
    var phrase = string.replace(new RegExp(`${regexClean(fullword)}\\s*`, 'i'), '')
    tempdata[msg.author.id].arrays[name] = splitKeyFunc(phr, { separator: separator })
    return [phrase, true]
  },
  attemptvalue: 5
}