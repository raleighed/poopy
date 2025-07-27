function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

module.exports = {
  helpf: '(name | seed)',
  desc: 'Creates a random generator function given the name and seed. Functions can be used by typing in [functionname].',
  func: function (matches, msg, _, string) {
    let poopy = this
    let { splitKeyFunc, regexClean } = poopy.functions
    let tempdata = poopy.tempdata

    var word = matches[1]
    var fullword = `${matches[0]}(${matches[1]})`
    var phrase = string.replace(new RegExp(`${regexClean(fullword)}\\s*`, 'i'), '')
    var split = splitKeyFunc(word, { args: 2 })

    var name = split[0]
    var seed = split[1]

    var seedFn = xmur3(seed)
    var rand = mulberry32(seedFn())

    tempdata[msg.author.id].declared[`[${name}]`] = seed
    tempdata[msg.author.id].funcdeclared[`[${name}]`] = {
      func: async function (matches) {
        var word = matches[1]
        var split = splitKeyFunc(word, { args: 2 })
        if (split.length <= 1 && split[0] == '') return rand()
        var min = Math.round(Number(split[0])) || 0
        var max = Math.round(Number(split[1])) || 0
        return Math.floor(rand() * (max + 1 - min)) + min
      }
    }

    return [phrase, true]
  }
}