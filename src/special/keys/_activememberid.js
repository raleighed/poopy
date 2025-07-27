module.exports = {
  desc: "Returns a random active member's ID from the server, this is calculated by the number of messages each one has sent and role order.",
  func: function (msg) {
    let poopy = this
    let data = poopy.data

    var datamembers = data.guildData[msg.guild.id].allMembers
    var keys = Object.keys(datamembers)

    var roles = msg.guild.roles?.cache?.size || 1

    var determineActiveValue = (id) => Math.max(
      Math.min(
        ((datamembers[id].messages || 0) + (25 * (datamembers[id].highestroleorder || 0))) * (datamembers[id].bot ? 0.1 : 1) || 0,
        100 * roles
      ) - Math.floor((Date.now() - datamembers[id].lastmessage || 0) / 604800000) * 10 * roles,
      0
    ) || 0

    var sum = 0
    for (var id in datamembers) {
      sum += determineActiveValue(id)
    }

    var rnd = Math.random() * sum
    var counter = 0

    for (var id in datamembers) {
      counter += determineActiveValue(id)
      if (counter > rnd) {
        return id
      }
    }

    return keys[0]
  },
  array: function (msg) {
    let poopy = this
    let data = poopy.data

    var datamembers = data.guildData[msg.guild.id].allMembers;
    return Object.keys(datamembers)
  }
}