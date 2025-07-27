module.exports = {
  helpf: '(arrayName | start | end)',
  desc: 'Slices the array from the start index and the end index.',
  func: function (matches, msg) {
    let poopy = this
    let { splitKeyFunc } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 3 })
    var name = split[0] ?? ''
    var start = split[1] ?? '0'
    var end = split[2] ?? 'Infinity'

    var array = tempdata[msg.author.id].arrays[name]
    if (!array) return ''

    tempdata[msg.author.id].arrays[name] = array.slice(start, end)

    return ''
  }
}