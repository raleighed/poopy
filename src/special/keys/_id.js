module.exports = {
    desc: 'Returns your own ID.', func: function (msg) {
        let poopy = this

        return msg.author.id
    }
}