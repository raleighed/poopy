module.exports = {
  helpf: '(id)',
  desc: 'Returns the content of the message in the channel with that ID.',
  func: async function (matches, msg, isBot, _, opts) {
    let poopy = this
    let { getKeywordsFor } = poopy.functions

    var word = matches[1]

    var message = msg.channel.messages.fetch(word || ' ')
    if (message.catch) message = await message.catch(() => { })
    if (!message) return ''

    return await getKeywordsFor(message.content ?? '', msg, isBot, opts).catch(() => { }) ?? ''
  },
  attemptvalue: 5
}