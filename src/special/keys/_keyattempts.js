module.exports = {
  desc: 'Returns your current key attempts.',
  func: function (msg) {
    let poopy = this
    let tempdata = poopy.tempdata

    return tempdata[msg.author.id][msg.id].keyattempts
  }
}