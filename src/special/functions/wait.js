module.exports = {
  helpf: '(seconds)',
  desc: 'Waits the specified seconds. Maximum is 60.',
  func: async function (matches, msg) {
    let poopy = this
    let tempdata = poopy.tempdata
    let { sleep } = poopy.functions

    var word = matches[1]
    var waitTime = Math.min(Math.max(Number(word), 0), 60)
    tempdata[msg.author.id][msg.id].keyattempts += !isNaN(waitTime) ? waitTime : 0
    await sleep(waitTime * 1000)
    return ''
  }
}