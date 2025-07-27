module.exports = {
    name: ['addtojson'],
    args: [{
        "name": "json", "required": true, "specifarg": false, "orig": "<json (psfiles, pspasta, funnygif, poop, dmphrases, shitting)>", "autocomplete": [
            'psfiles',
            'pspasta',
            'funnygif',
            'poop',
            'dmphrases',
            'shitting',
        ]
    }, { "name": "value", "required": true, "specifarg": false, "orig": "<value>" }],
    execute: async function (msg, args) {
        let poopy = this
        let config = poopy.config
        let globaldata = poopy.globaldata
        let arrays = poopy.arrays
        let { fetchPingPerms } = poopy.functions

        var jsonid = config.ownerids.find(id => id == msg.author.id) || config.jsoning.find(id => id == msg.author.id);
        if (jsonid === undefined) {
            await msg.reply('json club only').catch(() => { })
            return
        } else {
            var types = ['psfiles', 'pspasta', 'funnygif', 'poop', 'dmphrases', 'shitting']

            if (args[1] === undefined) {
                await msg.reply(`What is the JSON to update?! (Available: ${types.map(t => `**${t}**`).join(', ')})`).catch(() => { })
                return;
            } else if (args[2] === undefined) {
                await msg.reply('What is the value?!').catch(() => { })
                return;
            }

            var type

            if (types.find(t => t === args[1].toLowerCase())) {
                type = args[1].toLowerCase()
            } else {
                await msg.reply('Not a JSON type.').catch(() => { })
                return
            }
            var saidMessage = args.slice(2).join(' ')

            if (globaldata[type].find(v => v === saidMessage)) {
                await msg.reply('Already exists.').catch(() => { })
                return
            }

            globaldata[type].push(saidMessage)

            if (!msg.nosend) await msg.reply({
                content: '✅ Added ' + saidMessage,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })

            arrays.psFiles = globaldata.psfiles
            arrays.psPasta = globaldata.pspasta
            arrays.funnygifs = globaldata.funnygif
            arrays.poopPhrases = globaldata.poop
            arrays.dmPhrases = globaldata.dmphrases
            arrays.shitting = globaldata.shitting

            return '✅ Added ' + saidMessage
        };
    },
    help: {
        name: 'addtojson <json (psfiles, pspasta, funnygif, poop, dmphrases, shitting)> <value>',
        value: "Adds a new value to JSONs like Phexonia Studio's files."
    },
    cooldown: 2500,
    type: 'JSON Club'
}