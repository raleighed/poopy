module.exports = {
  helpf: '()',
  desc: 'Waits your current cooldown value.',
  func: async function (_, msg) {
    let poopy = this
    let data = poopy.data
    let { sleep } = poopy.functions

    var cooldown = (data.guildData[msg.guild.id].members[msg.author.id].coolDown || 0) - Date.now()
    await sleep(cooldown)
    return ''
  }
}