module.exports = {
    name: ['compile'],
    args: [{
        "name": "language", "required": true, "specifarg": false, "orig": "<language>", "autocomplete": function () {
            let poopy = this
            return poopy.vars.codelanguages.map(lang => {
                return { name: lang.language, value: lang.templates[0] }
            })
        }
    }, { "name": "code", "required": true, "specifarg": false, "orig": "<code>" }],
    execute: async function (msg, args) {
        let poopy = this
        let vars = poopy.vars
        let { axios } = poopy.modules
        let { fetchPingPerms } = poopy.functions

        await msg.channel.sendTyping().catch(() => { })

        var saidMessage = args.slice(1).join(' ')
        var language = args[1]

        var cl = -1
        var codeBlock = (saidMessage.match(/```[\s\S]+```/) ?? [])[0]
        if (codeBlock) {
            var codeLang = (codeBlock.match(/```[^\n\r]+[\n\r]/) ?? [])[0]
            if (codeLang) {
                cl = codeLang.length
                language = codeLang.substring(3).trim()
            }
        }

        if (language === undefined) {
            await msg.reply(`What is the programming language?! Available ones are:\n${vars.codelanguages.map(lang => `\`${lang.templates[0]}\``).join(', ')}`).catch(() => { })
            return
        }

        saidMessage = args.slice(cl > -1 ? 1 : 2).join(' ')
        if (codeBlock) saidMessage = saidMessage.substring(cl > -1 ? cl : 3, saidMessage.length - 3).trim()
        var langVersion

        var findLang = vars.codelanguages.find(lang => lang.templates[0] === language.toLowerCase())

        if (findLang) {
            langVersion = findLang.name
        } else {
            await msg.reply(`Not a valid programming language.\nAvailable ones are: ${vars.codelanguages.map(lang => `\`${lang.templates[0]}\``).join(', ')}`).catch(() => { })
            return
        }

        var response = await axios({
            url: 'https://wandbox.org/api/compile.ndjson',
            method: 'POST',
            data: {
                code: saidMessage,
                codes: [],
                compiler: langVersion,
                'compiler-option-raw': "",
                description: "",
                options: "",
                'runtime-option-raw': "",
                stdin: "",
                title: ""
            }
        }).catch(async err => {
            await msg.reply({
                content: err.stack,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
        })

        if (!response) return

        var jsons = response.data.trim().split('\n').map(json => JSON.parse(json))

        var stdOut = jsons.filter(json => json.type === 'StdOut').map(json => json.data).join('\n').trim()
        var stdErr = jsons.filter(json => json.type === 'StdErr').map(json => json.data).join('\n').trim()
        var output

        if (stdOut && stdErr) output = `StdOut: ${stdOut}\nStdErr: ${stdErr}`
        else output = (stdOut ?? stdErr) ? (stdOut ?? stdErr) : 'No output.'

        if (!msg.nosend) await msg.reply({
            content: output,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return output
    },
    help: {
        name: 'compile <language> <code>',
        value: 'Compiles the code in the specified language using Wandbox.\n' +
            'Pro Tip: You can also just write a code block with the language at the start.'
    },
    raw: true,
    type: 'Text'
}