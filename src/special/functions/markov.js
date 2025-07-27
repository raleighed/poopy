module.exports = {
    helpf: '(phrase)',
    desc: 'The markov chain generated AND THE Last Messages. turn on',
    func: function (matches, msg) {
        let poopy = this
        let data = poopy.data
        let json = poopy.json
        let arrays = poopy.arrays
        let { markovChainGenerator, markovMe, decrypt } = poopy.functions

        var word = matches[1]

        var messages = data.guildData[msg.guild.id].messages.slice().map(m => decrypt(m.content))
        if (messages.length <= 0) {
            messages = json.sentenceJSON.data.map(s => s.sentence).concat(arrays.psPasta)
        }
        if (word) {
            messages.push(word)
        }
        var markovChain = markovChainGenerator(messages.join('  '))
        var markov = markovMe(markovChain, word)

        return markov
    }
}