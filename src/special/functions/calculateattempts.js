module.exports = {
    helpf: '(phrase)',
    desc: 'Calculates the attempts needed to execute everything inside the function.',
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let tempdata = poopy.tempdata
        let { getKeywordsFor } = poopy.functions

        var word = matches[1]
        var currentAttempts = tempdata[msg.author.id][msg.id].keyattempts

        await getKeywordsFor(word, msg, isBot, opts).catch(() => { })

        return tempdata[msg.author.id][msg.id].keyattempts - currentAttempts
    },
    raw: true
}