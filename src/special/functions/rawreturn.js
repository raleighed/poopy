module.exports = {
    helpf: '(phrase)',
    desc: "Ends the keyword collection and returns the phrase, except keywords and functions aren't executed (unless they were declared)",
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let { getKeywordsFor } = poopy.functions
        let tempdata = poopy.tempdata

        var declopts = { ...opts }
        declopts.declaredonly = true
        var word = await getKeywordsFor(matches[1], msg, isBot, declopts).catch(() => { }) ?? ''

        tempdata[msg.author.id][msg.id].return = word

        return ''
    },
    raw: true
}