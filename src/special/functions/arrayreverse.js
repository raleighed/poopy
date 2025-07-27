module.exports = {
  helpf: '(arrayName)',
  desc: 'Reverses the array with that name.',
  func: function (matches, msg) {
    let poopy = this
    let tempdata = poopy.tempdata

    var word = matches[1]

    var array = tempdata[msg.author.id].arrays[word]
    if (!array) return ''

    tempdata[msg.author.id].arrays[word] = array.reverse()

    return ''
  }
}