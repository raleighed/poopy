module.exports = {
    helpf: '(arrayName | index | value)',
    desc: 'Sets the value in the array with that index to a new one.',
    func: async function (matches, msg) {
        let poopy = this
        let { splitKeyFunc } = poopy.functions
        let tempdata = poopy.tempdata

        var word = matches[1]
        var split = splitKeyFunc(word, { args: 3 })
        var name = split[0] ?? ''
        var index = Number(split[1] ?? '0')
        var newVal = split[2] ?? ''

        var array = tempdata[msg.author.id].arrays[name]
        if (!array) return ''
        if (index < 0) index += array.length

        array[index] = newVal

        return ''
    }
}