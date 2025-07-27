module.exports = {
    name: ['generatetext', 'generate', 'predicttext'],
    args: [{"name":"message","required":true,"specifarg":false,"orig":"<message>"},{"name":"temperature","required":false,"specifarg":true,"orig":"[-temperature <number (from 0 to 1)]"},{"name":"maxtokens","required":false,"specifarg":true,"orig":"[-maxtokens <number (max 512)>]"},{"name":"prespenalty","required":false,"specifarg":true,"orig":"[-(pres/count/freq)penalty <number (from 0 to 5/1/500)>]"},{"name":"countpenalty","required":false,"specifarg":true,"orig":"[-(pres/count/freq)penalty <number (from 0 to 5/1/500)>]"},{"name":"freqpenalty","required":false,"specifarg":true,"orig":"[-(pres/count/freq)penalty <number (from 0 to 5/1/500)>]"}],
    execute: async function (msg, args) {
        let poopy = this
        let { getOption, parseNumber, userToken, fetchPingPerms } = poopy.functions
        let { axios, fs, Discord } = poopy.modules
        let vars = poopy.vars
        let config = poopy.config

        await msg.channel.sendTyping().catch(() => { })

        var temperature = getOption(args, 'temperature', { dft: 0.6, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: 0.6, min: 0, max: 1, round: false }) })
        var maxtokens = getOption(args, 'maxtokens', { dft: 65, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: 65, min: 1, max: 512, round: true }) })
        var pres = getOption(args, 'prespenalty', { dft: 1, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: 1, min: 0, max: 5, round: false }) })
        var count = getOption(args, 'countpenalty', { dft: 0, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: 0, min: 0, max: 1, round: false }) })
        var freq = getOption(args, 'freqpenalty', { dft: 0, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: 0, min: 0, max: 500, round: true }) })
        var saidMessage = args.slice(1).join(' ')
        if (args[1] === undefined) {
            await msg.reply('What is the text to generate?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        }

        var models = ['j2-ultra', 'j2-mid', 'j2-light']

        for (var model of models) {
            var resp = await axios({
                url: `https://api.ai21.com/studio/v1/${model}/complete`,
                method: 'POST',
                data: {
                    prompt: saidMessage,
                    numResults: 1,
                    maxTokens: maxtokens,
                    temperature: temperature,
                    topKReturn: 0,
                    topP: 1,
                    presencePenalty: {
                        scale: pres,
                        applyToNumbers: false,
                        applyToPunctuations: false,
                        applyToStopwords: false,
                        applyToWhitespaces: false,
                        applyToEmojis: false
                    },
                    countPenalty: {
                        scale: count,
                        applyToNumbers: false,
                        applyToPunctuations: false,
                        applyToStopwords: false,
                        applyToWhitespaces: false,
                        applyToEmojis: false
                    },
                    frequencyPenalty: {
                        scale: freq,
                        applyToNumbers: false,
                        applyToPunctuations: false,
                        applyToStopwords: false,
                        applyToWhitespaces: false,
                        applyToEmojis: false
                    },
                    stopSequences: []
                },
                headers: {
                    Authorization: `Bearer ${userToken(msg.author.id, 'AI21_KEY')}`
                }
            }).catch((e) => console.log(e))

            if (resp) {
                if (!msg.nosend) await msg.reply({
                    content: `${saidMessage}${resp.data.completions[0].data.text}`,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(async () => {
                    var currentcount = vars.filecount
                    vars.filecount++
                    var filepath = `temp/${config.database}/file${currentcount}`
                    fs.mkdirSync(`${filepath}`)
                    fs.writeFileSync(`${filepath}/generated.txt`, `${saidMessage}${resp.data.completions[0].data.text}`)
                    await msg.reply({
                        files: [new Discord.AttachmentBuilder(`${filepath}/generated.txt`)]
                    }).catch(() => { })
                    fs.rmSync(`${filepath}`, { force: true, recursive: true })
                })
                return `${saidMessage}${resp.data.completions[0].data.text}`
            }
        }
    },
    help: {
        name: 'generatetext/generate/predicttext <message> [-temperature <number (from 0 to 1)] [-maxtokens <number (max 512)>] [-(pres/count/freq)penalty <number (from 0 to 5/1/500)>]',
        value: 'Tries to predict subsequent text from the specified message with AI21. Default max tokens are 65 and temperature is 0.6.'
    },
    type: 'Generation',
    envRequired: ['AI21_KEY']
}
