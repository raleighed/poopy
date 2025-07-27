module.exports = {
    name: ['destroy', 'shutdown', 'die'],
    args: [],
    execute: async function (msg, _, opts) {
        let poopy = this
        let config = poopy.config
        let { yesno } = poopy.functions

        var ownerid = config.ownerids.find(id => id == msg.author.id);
        if (ownerid === undefined && !opts.ownermode) {
            await msg.reply('Owner only!').catch(() => { })
            return
        }

        var confirm = msg.nosend || await yesno(msg.channel, 'are you sure about killing me', msg.member, undefined, msg).catch(() => { })
        if (!confirm) return

        if (!msg.nosend) await msg.reply('The salami lid').catch(() => { })
        await poopy.destroy(true)
        
        throw new Error("Poopy has been successfully destroyed. Absolutely phenomenal!")
    },
    help: { name: 'destroy/shutdown/die', value: 'Causes Poopy to shutdown.' },
    type: 'Owner'
}