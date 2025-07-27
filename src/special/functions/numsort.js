module.exports = {
  helpf: '(arrayName)',
  desc: 'Sorts the array numerically.',
  func: function (matches, msg) {
    let poopy = this
    let tempdata = poopy.tempdata

    var word = matches[1]

    var array = tempdata[msg.author.id].arrays[word]
    if (!array) return ''

    array.sort((a, b) => {
      return Number(a) - Number(b)
    })

    return ''
  }
}