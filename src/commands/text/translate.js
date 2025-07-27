module.exports = {
    name: ['translate', 'tr'],
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
    }],
    execute: async function (msg, args) {
        let poopy = this
        let vars = poopy.vars
        let { axios } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })
        if (args[1] === undefined) {
            await msg.reply(`What is the text to translate?! A list of supported languages are:\n${Object.values(vars.languages).map(language => `\`${language}\``).join(', ')}`).catch(() => { })
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

        var saidMessage = args.slice(1).join(' ')

        var options = {
            method: 'GET',
            url: "https://translate.googleapis.com/translate_a/single?" + new URLSearchParams({
                client: "gtx",
                sl: source,
                tl: target,
                dt: "t",
                dj: "1",
                source: "input",
                q: saidMessage
            })
        };

        var response = await axios(options).catch(async () => {
            await msg.reply('Error.').catch(() => { })
        })

        if (!response) return

        if (!msg.nosend) await msg.reply({
            content: response.data.sentences.
                map(s => s?.trans).
                filter(Boolean).
                join(""),
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return response.data.sentences.
            map(s => s?.trans).
            filter(Boolean).
            join("")
    },
    help: {
        name: 'translate/tr <message> [-source <language>] [-target <language>]',
        value: 'Translates the specified message. The default source language is auto and the default target language is English.'
    },
    type: 'Text'
}