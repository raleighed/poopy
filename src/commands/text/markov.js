module.exports = {
    name: ['markov'],
    args: [{"name":"message","required":false,"specifarg":false,"orig":"[message]"},{"name":"words","required":false,"specifarg":true,"orig":"[-words <wordNumber>]"},{"name":"nopunctuation","required":false,"specifarg":true,"orig":"[-nopunctuation]"},{"name":"keepcase","required":false,"specifarg":true,"orig":"[-keepcase]"},{"name":"randlerp","required":false,"specifarg":true,"orig":"[-randlerp <number (from 0 to 1)>]"},{"name":"randomsentences","required":false,"specifarg":true,"orig":"[-randomsentences]"}],
    execute: async function (msg, args) {
        let poopy = this
        let {
            getOption, parseNumber, markovChainGenerator,
            fetchPingPerms, markovMe, decrypt
        } = poopy.functions
        let data = poopy.data
        let json = poopy.json
        let arrays = poopy.arrays
        let vars = poopy.vars
        let config = poopy.config
        let { fs, Discord } = poopy.modules

        var wordNumber = getOption(args, 'words', { dft: Math.floor(Math.random() * 20) + 1, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: Math.floor(Math.random() * 20) + 1, min: 1, max: 10000, round: true }) })
        var nopunctuation = getOption(args, 'nopunctuation', { dft: false, splice: true, n: 0, join: true })
        var keepcase = getOption(args, 'keepcase', { dft: false, splice: true, n: 0, join: true })
        var randlerp = getOption(args, 'randlerp', { dft: 0.4, splice: true, n: 1, join: true })
        var randomsentences = getOption(args, 'randomsentences', { dft: false, splice: true, n: 0, join: true })

        var saidMessage = args.join(' ').substring((args[0] || '').length + 1)
        var messages = data.guildData[msg.guild.id].messages.slice().map(m => decrypt(m.content))
        if (messages.length <= 0 || randomsentences) {
            messages = json.sentenceJSON.data.map(s => s.sentence).concat(arrays.psPasta)
        }
        if (saidMessage) {
            messages.push(saidMessage)
        }
        await msg.channel.sendTyping().catch(() => { })
        var markovChain = markovChainGenerator(messages.join('  '))
        var markov = markovMe(markovChain, saidMessage, {
            wordNumber: wordNumber,
            nopunctuation: nopunctuation,
            keepcase: keepcase,
            randlerp: randlerp
        })
        if (!msg.nosend) await msg.reply({
            content: markov,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(async () => {
            var currentcount = vars.filecount
            vars.filecount++
            var filepath = `temp/${config.database}/file${currentcount}`
            fs.mkdirSync(`${filepath}`)
            fs.writeFileSync(`${filepath}/markov.txt`, markov)
            await msg.reply({
                files: [new Discord.AttachmentBuilder(`${filepath}/markov.txt`)]
            }).catch(() => { })
            fs.rmSync(`${filepath}`, { force: true, recursive: true })
        })
        return markov
    },
    help: {
        name: 'markov [message] [-words <wordNumber>] [-nopunctuation] [-keepcase] [-randlerp <number (from 0 to 1)>] [-randomsentences]',
        value: 'the Poopy Markov includes last messages. TOGLE'
    },
    cooldown: 2500,
    type: 'Text'
}