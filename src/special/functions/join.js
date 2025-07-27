module.exports = {
  helpf: '(arrayName | separator)',
  desc: 'Joins all the elements in the array with the separator.',
  func: async function (matches, msg, isBot, _, opts) {
    let poopy = this
    let { splitKeyFunc, getKeywordsFor } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var split = splitKeyFunc(word, { args: 2 })
    var name = await getKeywordsFor(split[0] ?? '', msg, isBot, opts).catch(() => { }) ?? ''
    var separator = split[1] ?? ''

    var array = tempdata[msg.author.id].arrays[name]
    if (!array) return ''

    var keyValues = array.map(async val => {
      return await getKeywordsFor(val, msg, isBot, opts).catch(() => { }) ?? ''
    })

    var asyncArray = await Promise.all(keyValues).catch(() => { }) ?? []

    return asyncArray.join(separator)
  }
}