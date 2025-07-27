module.exports = {
  helpf: '(phrase)',
  desc: 'Generates a response to the phrase inside the function with Cleverbot AI.',
  func: async function (matches, msg) {
    let poopy = this
    let { cleverbot } = poopy.functions

    var word = matches[1]

    var resp = await cleverbot(word, msg.author.id).catch(() => { })

    if (resp) {
      return resp
    }

    return word
  },
  attemptvalue: 10,
  cmdconnected: ['cleverbot']
}