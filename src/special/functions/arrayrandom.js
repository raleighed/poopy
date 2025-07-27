module.exports = {
  helpf: '(arrayName)',
  desc: 'Returns a random element from the array.',
  func: function (matches, msg) {
    let poopy = this
    let tempdata = poopy.tempdata

    var word = matches[1]
    var array = tempdata[msg.author.id].arrays[word] ?? []
    return array.length > 0 ? array[Math.floor(Math.random()*array.length)] : ''
  }
}
