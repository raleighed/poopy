module.exports = {
    helpf: '(phrase)',
    desc: 'Ends the keyword collection and returns the phrase.',
    func: function (matches, msg) {
        let poopy = this
        let tempdata = poopy.tempdata

        var word = matches[1]
        tempdata[msg.author.id][msg.id].return = word

        return ''
    }
}