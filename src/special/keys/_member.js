module.exports = {
  desc: 'Returns a random member from the server.',
  func: function (msg) {
    let poopy = this
    let data = poopy.data

    var datamembers = data.guildData[msg.guild.id].allMembers;
    var members = []
    for (var id in datamembers) {
      var datamember = datamembers[id]
      if (datamember.username) members.push(datamember.username)
    }
    return members[Math.floor(Math.random() * members.length)].replace(/\@/g, '@‌')
  },
  array: function (msg) {
    let poopy = this
    let data = poopy.data

    var datamembers = data.guildData[msg.guild.id].allMembers;
    var members = []
    for (var id in datamembers) {
      var datamember = datamembers[id]
      if (datamember.username) members.push(datamember.username)
    }
    return members.map(member => member.replace(/\@/g, '@‌'))
  }
}