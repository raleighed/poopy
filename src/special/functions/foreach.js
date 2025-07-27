module.exports = {
    helpf: '(arrayName | function<_index|_val>)',
    desc: "For each value in that array, it'll execute the function.",
    func: async function (matches, msg, isBot, _, opts) {
        let poopy = this
        let { splitKeyFunc, getKeywordsFor, sleep } = poopy.functions
        let tempdata = poopy.tempdata

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 2 })
        var name = await getKeywordsFor(split[0] ?? '', msg, isBot).catch(() => { }) ?? ''
        var func = split[1] ?? ''

        var array = tempdata[msg.author.id].arrays[name]
        if (!array) return ''

        for (var index in array) {
            var val = array[index]
            var valOpts = { ...opts }
            valOpts.extrakeys._val = {
                func: async () => {
                    return val
                }
            }
            valOpts.extrakeys._index = {
                func: async () => {
                    return index
                }
            }

            await getKeywordsFor(func, msg, isBot, valOpts).catch(() => { })
            await sleep()
        }

        return ''
    },
    attemptvalue: 5,
    raw: true
}