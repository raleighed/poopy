const GraphemeSplitter = require('grapheme-splitter')
const graphemes = new GraphemeSplitter()
const emojiRegex = require('emoji-regex')()
const matches = {
  emoji: new RegExp(`^(${emojiRegex.source})`),
  discord: /^<a?:.+?:[0-9]+>/,
  image: /^<Img=((http|https):\/\/[^ "<>]+)>/
}

function getMatch(str, index) {
  for (var i in matches) {
    var match = str.slice(index).match(matches[i])
    if (match) {
      return {
        type: i,
        brk: index + match[0].length
      }
    }
  }

  return {
    type: 'normal',
    brk: graphemes.nextBreak(str, index)
  }
}

module.exports = function (str) {
  var res = [];
  var index = 0;
  var brk;

  while (index < str.length) {
    var matchcontent = getMatch(str, index)
    var type = matchcontent.type

    brk = matchcontent.brk

    res.push({
      grapheme: str.substring(brk, index),
      type: type
    });

    index = brk;
  }

  if (index < str.length) {
    var matchcontent = getMatch(str, index)
    var type = matchcontent.type

    res.push({
      grapheme: str.slice(index),
      type: type
    });
  }

  return res;
}
