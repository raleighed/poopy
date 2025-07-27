module.exports = {
    helpf: '(randomSentences)',
    desc: 'The markov chain generated AND THE Last Messages. uses diffrent algorithm!',
    func: function (matches, msg) {
        let poopy = this
        let data = poopy.data
        let json = poopy.json
        let arrays = poopy.arrays
        let { markov, decrypt } = poopy.functions

        var word = matches[1]

        var messages = data.guildData[msg.guild.id].messages.slice().map(m => decrypt(m.content))
        if (messages.length <= 0 || word) {
            messages = json.sentenceJSON.data.map(s => s.sentence).concat(arrays.psPasta)
        }

        return markov(messages)
    }
}