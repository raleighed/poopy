module.exports = {
  helpf: '(arrayName | keywordName)',
  desc: "Creates an array from a default set of words from the specified keyword name.",
  func: function (matches, msg, _, string) {
    let poopy = this
    let special = poopy.special
    let { regexClean, splitKeyFunc } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 2 })
    var name = split[0] ?? ''
    var key = split[1] ?? ''
    var fullword = `${matches[0]}(${matches[1]})`
    var phrase = string.replace(new RegExp(`${regexClean(fullword)}\\s*`, 'i'), '')
    var array = special.keys[`_${key.toLowerCase()}`].array
    if (!array) return ''
    tempdata[msg.author.id].arrays[name] = typeof array == 'function' ? array.call(poopy, msg) : array

    return [phrase, true]
  },
  attemptvalue: 5
}