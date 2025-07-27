module.exports = {
  helpf: '(arrayName | index | deleteCount)',
  desc: 'Removes n elements in the array starting from the index.',
  func: function (matches, msg) {
    let poopy = this
    let { splitKeyFunc } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 3 })
    var name = split[0] ?? ''
    var index = split[1] ?? '0'
    var deleteCount = split[2] ?? '1'

    var array = tempdata[msg.author.id].arrays[name]
    if (!array) return ''

    array.splice(index, deleteCount)

    return ''
  }
}