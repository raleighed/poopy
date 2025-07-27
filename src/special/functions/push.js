module.exports = {
  helpf: '(arrayName | value)',
  desc: 'Pushes a new value to an array.',
  func: function (matches, msg) {
    let poopy = this
    let { splitKeyFunc } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 2 })
    var name = split[0] ?? ''
    var value = split[1] ?? ''

    var array = tempdata[msg.author.id].arrays[name]
    if (!array) return ''

    array.push(value)

    return ''
  }
}