module.exports = {
  helpf: '(arrayName)',
  desc: "Creates a new array with the specified name. If it already exists, it'll be cleared.",
  func: function (matches, msg, _, string) {
    let poopy = this
    let { regexClean } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var fullword = `${matches[0]}(${matches[1]})`
    var phrase = string.replace(new RegExp(`${regexClean(fullword)}\\s*`, 'i'), '')
    tempdata[msg.author.id].arrays[word] = []

    return [phrase, true]
  },
  attemptvalue: 5
}