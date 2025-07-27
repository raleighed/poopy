module.exports = {
  helpf: '(id)',
  desc: 'Fetches the username of the user with the specified ID.',
  func: async function (matches) {
    let poopy = this
    let bot = poopy.bot

    var word = matches[1]

    var user = await bot.users.fetch(word).catch(() => { })

    return user ? user.displayName.replace(/\@/g, '@‌') : ''
  }
}