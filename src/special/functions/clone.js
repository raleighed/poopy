module.exports = {
  helpf: '(arrayName | cloneName)',
  desc: "Clones a new array from an existing one, giving it a new name. If it doesn't exist, it'll just create a new one.",
  func: function (matches, msg, _, string) {
    let poopy = this
    let { splitKeyFunc, regexClean } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var fullword = `${matches[0]}(${matches[1]})`
    var split = splitKeyFunc(word, { args: 2 })
    var name = split[0] ?? ''
    var clone = split[1] ?? '0'
    var phrase = string.replace(new RegExp(`${regexClean(fullword)}\\s*`, 'i'), '')

    var array = tempdata[msg.author.id].arrays[name]
    if (!array) return ''

    tempdata[msg.author.id].arrays[clone] = array || []

    return [phrase, true]
  },
  attemptvalue: 5
}