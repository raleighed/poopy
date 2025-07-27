module.exports = {
  helpf: '(index)',
  desc: 'Returns the content of the last message in the channel. If index is specified, it returns the content of the message with that index.',
  func: async function (matches, msg, isBot, _, opts) {
    let poopy = this
    let { parseNumber, getKeywordsFor } = poopy.functions

    var f = matches[0]
    var word = matches[1]

    var messages = msg.channel.messages.fetch()
    if (messages.catch) messages = await messages.catch(() => { })
    if (!messages) return ''

    var index = parseNumber(word, { dft: 0, min: 0, max: messages.size - 1, round: true })

    return await getKeywordsFor(([...messages.values()][index].content ?? '').replace(new RegExp(`${f}\\(([\\s\\S]*?)\\)`, 'ig'), ''), msg, isBot, opts).catch(() => { }) ?? ''
  },
  attemptvalue: 10
}