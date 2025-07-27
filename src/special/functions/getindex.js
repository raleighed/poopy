module.exports = {
    helpf: '(arrayName | index)',
    desc: 'Gets the value in the array with that index.',
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let { splitKeyFunc, getKeywordsFor } = poopy.functions
        let tempdata = poopy.tempdata

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 2 })
        var name = split[0] ?? ''
        var index = Number(split[1] ?? '0')

        var array = tempdata[msg.author.id].arrays[name]
        if (!array) return ''
        if (index < 0) index += array.length

        return await getKeywordsFor(array[index], msg, isBot, opts).catch(() => { }) ?? ''
    }
}