module.exports = {
    name: ['makesweet', 'heartlocket'],
    args: [{ "name": "textes", "required": false, "specifarg": false, "orig": "\"{text1}\"..." }, { "name": "files", "required": false, "specifarg": false, "orig": "{file1}..." }, { "name": "textfirst", "required": false, "specifarg": true, "orig": "[-textfirst]" }, {
        "name": "template", "required": false, "specifarg": true, "orig": "[-template <name>]", "autocomplete": [
            'billboard-cityscape',
            'circuit-board',
            'flag',
            'flying-bear',
            'heart-locket',
            'nesting-doll'
        ]
    }],
    execute: async function (msg, args) {
        let poopy = this
        let vars = poopy.vars
        let { getUrls, validateFile, downloadFile, sendFile } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let config = poopy.config
        let { fs, FormData, axios } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })

        var templates = {
            'billboard-cityscape': 1,
            'circuit-board': 1,
            'flag': 1,
            'flying-bear': 1,
            'heart-locket': 2,
            'nesting-doll': 3
        }
        var template = `heart-locket`
        var templateindex = args.indexOf('-template')
        if (templateindex > -1) {
            if (templates[args[templateindex + 1].toLowerCase()]) {
                template = args[templateindex + 1].toLowerCase()
            } else {
                await msg.reply('Not a supported template.').catch(() => { })
                return
            }
        }

        var textfirst = args.includes('-textfirst')

        var saidMessage = args.slice(1).join(' ').replace(/’/g, '\'')
        vars.symbolreplacements.forEach(symbolReplacement => {
            symbolReplacement.target.forEach(target => {
                saidMessage = saidMessage.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
            })
        })

        var textes = (saidMessage.match(/"([\s\S]*?)"/g) ?? []).slice(0, templates[template]).map(t => t.substring(1, t.length - 1))
        var files = []

        var fetched = await getUrls(msg, { max: templates[template] - textes.length }).catch(() => { }) ?? []

        if (textes.length <= 0 && fetched.length <= 0) {
            await msg.reply('What are the arguments?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };

        var filepath

        for (var i in fetched) {
            var url = fetched[i]

            var fileinfo = await validateFile(url).catch(async error => {
                await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
                await msg.channel.sendTyping().catch(() => { })
                return
            })

            if (!fileinfo) return

            var filetype = fileinfo.type
            if (!filetype || !(filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext)))) {
                await msg.reply({
                    content: `Unsupported file: \`${url}\``,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => { })
                return
            }
        }

        var currentcount = vars.filecount
        vars.filecount++
        var filepath = `temp/${config.database}/file${currentcount}`

        fs.mkdirSync(`${filepath}`)

        for (var i in fetched) {
            var url = fetched[i]

            await downloadFile(url, `input${files.length}.${fileinfo.shortext}`, {
                fileinfo,
                filepath: filepath
            })
            var filename = `input${files.length}.${fileinfo.shortext}`
            files.push(filename)
        }

        var form = new FormData()

        files.forEach(filename => form.append('images', fs.readFileSync(`${filepath}/${filename}`), filename))

        var response = await axios({
            url: `http://api.makesweet.com/make/${template}${textes.length > 0 ? `?${textes.map(text => `text=${encodeURIComponent(text)}`).join('&')}${textfirst && templates[template] > 1 ? `&textfirst=1` : ''}` : ''}`,
            method: 'POST',
            data: form,
            headers: {
                ...form.getHeaders(),
                Authorization: process.env.MAKESWEET_KEY
            },
            responseType: 'arraybuffer'
        }).catch(async (e) => {
            await msg.reply({
                content: e.response.statusText,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            fs.rmSync(`${filepath}`, { force: true, recursive: true })
        })

        if (!response) return

        await downloadFile(response.data, `output.gif`, {
            buffer: true,
            filepath: filepath
        })
        return await sendFile(msg, filepath, `output.gif`)
    },
    help: {
        name: 'makesweet/heartlocket "{text1}"... {file1}... [-textfirst] [-template <name>]',
        value: "Creates a MakeSweet GIF depending on the template, if specified. Available templates are billboard-cityscape, circuit-board, flag, flying-bear, heart-locket and nesting-doll. Try it yourself at https://makesweet.com/"
    },
    cooldown: 2500,
    type: 'Memes',
    envRequired: ['MAKESWEET_KEY']
}