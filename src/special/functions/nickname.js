module.exports = {
  helpf: '(id)',
  desc: 'Fetches the nickname of the user with the specified ID.',
  func: async function (matches, msg) {
    let poopy = this
    let bot = poopy.bot

    var word = matches[1]

    var user = await msg.guild.members.fetch(word).catch(() => { }) ?? await bot.users.fetch(word).catch(() => { })

    return user ? (user.nickname ?? user.displayName).replace(/\@/g, '@‌') : ''
  }
}