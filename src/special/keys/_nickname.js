module.exports = {
    desc: 'Returns your own nickname.', func: function (msg) {
        let poopy = this

        return msg.member.displayName.replace(/\@/g, '@‌')
    }
}