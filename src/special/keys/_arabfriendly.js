module.exports = {
  desc: `Returns a random word from the arabottify command's dictionary, except it doesn't include naughty words.`,
  func: function () {
    let poopy = this
    let json = poopy.json
    let { randomChoice } = poopy.functions

    return randomChoice(json.arabJSON.words.filter(arab => !json.arabJSON.danger.includes(arab)))
  },
  array: function () {
    let poopy = this
    let json = poopy.json

    return json.arabJSON.words.filter(arab => !json.arabJSON.danger.includes(arab))
  }
}