module.exports = {
  desc: 'Returns a random message from the server. Requires permission for the bot to read messages within a channel.',
  func: function (msg) {
    let poopy = this
    let data = poopy.data
    let { decrypt } = poopy.functions

    var messages = data.guildData[msg.guild.id].messages
    return messages.length ? decrypt(messages[Math.floor(Math.random() * messages.length)].content).replace(/\@/g, '@‌') : ''
  },
  array: function (msg) {
    let poopy = this
    let data = poopy.data
    let { decrypt } = poopy.functions

    var messages = data.guildData[msg.guild.id].messages
    return messages.map(m => decrypt(m.content).replace(/\@/g, '@‌'))
  }
}