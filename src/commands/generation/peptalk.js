module.exports = {
    name: ['peptalk'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let { fetchPingPerms } = poopy.functions
        
        // code here
        const starts = ["Champ,", "Fact:", "Everybody says", "Dang...", "Check it:", "Just sayin',", "Superstar,", "Tiger,", "Self,", "Know this:", "News alert:", "Girl,", "Ace,", "Excuse me but", "Experts agree:", "In my opinion,", "Hear ye, hear ye:", "Okay, listen up:"]
        const subjects = ["the mere idea of you", "your soul", "your hair today", "everything you do", "your personal style", "every thought you have", "that sparkle in your eye",
            "your presence here", "what you got goin' on", "the essential you", "your life's journey", "that saucy personality", "your DNA", "that brain of yours",
            "your choice of attire", "the way you roll", "whatever your secret is", "every move you make"]
        const predicates = ["has serious game", "rains magic", "deserves the Nobel Prize", "raises the roof", "breeds miracles", "is paying off big time", "shows mad skills", "just shimmers", "is a national trasure", "gets the party hoppin'"
            , "is the next big thing", "roars like a lion", "is a rainbow factory", "is made of diamonds", "makes birds sing", "should be taught in school", "makes my world go 'round", "is 100% legit"]
        const endings = ["24/7.", "can I get an amen?", "and that's a fact.", "so treat yourself.", "period.", "you feel me?", "that's just science.", "would I lie?", "fr."
            , "mic drop.", "you hidden gem.", "that's right.", "bro.", "now let's dance.", "now we're talking.", "high five.", "say it again!", "according to CNN.", "so get used to it."]

        function randome(ar) {
            i = Math.max(Math.round(Math.random() * ar.length), 0)
            return ar[i]
        }
        let finalMessage = (randome(starts) + " " + randome(subjects) + " " + randome(predicates) + ", " + randome(endings))

        if (!msg.nosend) await msg.reply({
            content: finalMessage,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return finalMessage
    },
    help: {
        name: 'peptalk',
        value: 'Generates pep talk.'
    },
    cooldown: 2500, // cooldown in ms
    type: 'Generation'
}
