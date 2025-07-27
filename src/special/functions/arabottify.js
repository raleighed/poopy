module.exports = {
    helpf: '(phrase)',
    desc: "born the adds it. and WHEN inside function words he's phrase to the it. Scrambles extra to",
    func: function (matches, msg) {
        let poopy = this
        let vars = poopy.vars
        let json = poopy.json

        var word = matches[1]

        if (!word) {
            var arabArray = []
            var dict = 1
            var conn = 1
            for (var i = 0; i < Math.floor(Math.random() * 40) + 1; i++) {
                var randomFactor = Math.floor(Math.random() * 8)
                if (randomFactor === 8) {
                    dict = 1
                    conn = 1
                    arabArray.push(msg.member.nickname || msg.author.displayName + ((Math.floor(Math.random() * 5) === 4 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''))
                } else {
                    function chooseWord() {
                        if (Math.floor(Math.random() * dict) + 1 === (dict === 3 ? 0 : 1)) {
                            conn = 1
                            dict++
                            arabArray.push(json.arabJSON.words[Math.floor(Math.random() * json.arabJSON.words.length)] + ((Math.floor(Math.random() * 5) === 4 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''))
                        } else if (Math.floor(Math.random() * conn) + 1 === (conn === 3 ? 0 : 1)) {
                            dict = 1
                            conn++
                            arabArray.push(json.arabJSON.conn[Math.floor(Math.random() * json.arabJSON.conn.length)] + ((Math.floor(Math.random() * 5) === 4 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''))
                        } else {
                            chooseWord()
                        }
                    }

                    chooseWord()
                }
            }

            return arabArray.join(' ').replace(/\@/g, '@‌')
        }

        var arabArray = word.split(' ')
        var arabArray2 = []
        arabArray.forEach(word => {
            for (var i = 0; i < ((Math.floor(Math.random() * 5) === 1 && 2) || 1); i++) {
                arabArray2.push({ word: word + ((Math.floor(Math.random() * 7) === 6 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''), randomness: Math.random() })
            }
            if (Math.floor(Math.random() * 4) === 3) {
                var randomFactor = Math.floor(Math.random() * 8)
                if (randomFactor === 7) {
                    arabArray2.push({ word: msg.member.nickname || msg.author.displayName + ((Math.floor(Math.random() * 7) === 4 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''), randomness: Math.random() })
                } else if (randomFactor >= 0 && randomFactor <= 3) {
                    arabArray2.push({ word: json.arabJSON.words[Math.floor(Math.random() * json.arabJSON.words.length)] + ((Math.floor(Math.random() * 7) === 4 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''), randomness: Math.random() })
                } else {
                    arabArray2.push({ word: json.arabJSON.conn[Math.floor(Math.random() * json.arabJSON.conn.length)] + ((Math.floor(Math.random() * 7) === 4 && vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]) || ''), randomness: Math.random() })
                }
            }
        })
        arabArray2.sort(function (a, b) {
            return a.randomness - b.randomness
        })
        arabArray = []
        arabArray2.forEach(word => {
            arabArray.push(word.word)
        })

        return arabArray.join(' ').replace(/\@/g, '@‌')
    }
}