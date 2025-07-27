module.exports = {
    helpf: '(id)',
    desc: 'Returns a random message from a member in the server. Requires permission for the bot to read messages within a channel.',
    func: function (matches, msg) {
        let poopy = this
        let data = poopy.data
        let { decrypt } = poopy.functions

        var word = matches[1]

        var messages = data.guildData[msg.guild.id].messages.filter(message => message.author == word)
        return messages.length ? decrypt(messages[Math.floor(Math.random() * messages.length)].content).replace(/\@/g, '@‌') : ''
    }
}