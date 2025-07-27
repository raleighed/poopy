module.exports = {
  desc: "Returns a random member's ID from the server.",
  func: function (msg) {
    let poopy = this
    let data = poopy.data

    var datamembers = data.guildData[msg.guild.id].allMembers;
    var keys = Object.keys(datamembers)
    return keys[Math.floor(Math.random() * keys.length)]
  },
  array: function (msg) {
    let poopy = this
    let data = poopy.data

    var datamembers = data.guildData[msg.guild.id].allMembers;
    return Object.keys(datamembers)
  }
}