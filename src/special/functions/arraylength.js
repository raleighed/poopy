module.exports = {
  helpf: '(arrayName)',
  desc: 'Returns the length of the array.',
  func: function (matches, msg) {
    let poopy = this
    let tempdata = poopy.tempdata

    var word = matches[1]
    return (tempdata[msg.author.id].arrays[word] ?? []).length
  }
}