module.exports = {
    name: ['badtranslate', 'badtr'],
    args: [{ "name": "message", "required": true, "specifarg": false, "orig": "<message>" }, {
        "name": "source", "required": false, "specifarg": true, "orig": "[-source <language>]",
        "autocomplete": function () {
            let poopy = this
            return Object.entries(poopy.vars.languages).map(language => {
                return { name: language[1], value: language[0] }
            })
        }
    }, {
        "name": "target", "required": false, "specifarg": true, "orig": "[-target <language>]",
        "autocomplete": function () {
            let poopy = this
            return Object.entries(poopy.vars.languages).map(language => {
                return { name: language[1], value: language[0] }
            })
        }
    }, { "name": "languages", "required": false, "specifarg": true, "orig": "[-languages <number (max 25)>]" },
    { "name": "details", "required": false, "specifarg": true, "orig": "[-details]" }],
    execute: async function (msg, args) {
        let poopy = this
        let vars = poopy.vars
        let { getOption, fetchPingPerms } = poopy.functions
        let { axios } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        var details = getOption(args, 'details', { n: 0, splice: true, dft: false })
        if (args[1] === undefined) {
            await msg.reply('What is the text to translate?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        }

        var source = 'auto'
        var sourceindex = args.indexOf('-source')
        if (sourceindex > -1) {
            if (Object.entries(vars.languages).find(language => language[0] == args[sourceindex + 1].toLowerCase() || language[1] == args[sourceindex + 1].toLowerCase())) {
                source = Object.entries(vars.languages).find(language => language[0] == args[sourceindex + 1].toLowerCase() || language[1] == args[sourceindex + 1].toLowerCase())[0]
            } else {
                await msg.reply(`Not a supported source language. A list of supported languages are:\n${Object.values(vars.languages).map(language => `\`${language}\``).join(', ')}`).catch(() => { })
                return
            }
            args.splice(sourceindex, 2)
        }

        var target = 'en'
        var targetindex = args.indexOf('-target')
        if (targetindex > -1) {
            if (Object.entries(vars.languages).find(language => language[0] == args[targetindex + 1].toLowerCase() || language[1] == args[targetindex + 1].toLowerCase())) {
                target = Object.entries(vars.languages).find(language => language[0] == args[targetindex + 1].toLowerCase() || language[1] == args[targetindex + 1].toLowerCase())[0]
            } else {
                await msg.reply(`Not a supported target language. A list of supported languages are:\n${Object.values(vars.languages).map(language => `\`${language}\``).join(', ')}`).catch(() => { })
                return
            }
            args.splice(targetindex, 2)
        }

        var repeat = 5
        var languagesindex = args.indexOf('-languages')
        if (languagesindex > -1) {
            repeat = isNaN(Number(args[languagesindex + 1])) ? 5 : Number(args[languagesindex + 1]) <= 2 ? 2 : Number(args[languagesindex + 1]) >= 250 ? 250 : Math.round(Number(args[languagesindex + 1])) || 5
            args.splice(languagesindex, 2)
        }

        var saidMessage = args.slice(1).join(' ')

        var output = saidMessage
        var lastlanguage = source
        var currentlanguage = Object.keys(vars.languages)[Math.floor(Math.random() * Object.keys(vars.languages).length)]

        var lmessage = !msg.nosend && details && await msg.reply({
            content: `Translating from ${vars.languages[lastlanguage]} to ${vars.languages[currentlanguage]}. (${output})`,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })

        for (var i = 0; i < repeat; i++) {
            var options = {
                method: 'GET',
                url: "https://translate.googleapis.com/translate_a/single?" + new URLSearchParams({
                    client: "gtx",
                    sl: lastlanguage,
                    tl: currentlanguage,
                    dt: "t",
                    dj: "1",
                    source: "input",
                    q: output
                })
            };

            var response = await axios(options).catch(async () => {
                await msg.reply('Error.').catch(() => { })
            })

            if (!response) {
                return
            }

            output = response.data.sentences.
                map(s => s?.trans).
                filter(Boolean).
                join("")

            lastlanguage = currentlanguage
            currentlanguage = i == repeat - 2 ? target : Object.keys(vars.languages)[Math.floor(Math.random() * Object.keys(vars.languages).length)]
            if (lmessage && i != repeat - 1 && !msg.nosend) {
                await lmessage.edit(`Translating from ${vars.languages[lastlanguage]} to ${vars.languages[currentlanguage]}. (${output})`).catch(() => { })
            }
        }

        if (lmessage) {
            await lmessage.delete().catch(() => { })
        }

        if (!msg.nosend) await msg.reply({
            content: output,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return output
    },
    help: {
        name: 'badtranslate/badtr <message> [-source <language>] [-target <language>] [-languages <number (max 250)>] [-details]',
        value: 'Badly translates the specified message. The default source language is auto and the default target language is English.'
    },
    type: 'Text'
}