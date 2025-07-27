module.exports = {
    name: ['webhookattachments', 'toggleattachments'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let data = poopy.data
        let { fetchPingPerms } = poopy.functions

        data.guildData[msg.guild.id].webhookAttachments = !data.guildData[msg.guild.id].webhookAttachments
        if (!msg.nosend) await msg.reply({
            content: `Attachments from webhooks have been **${data.guildData[msg.guild.id].webhookAttachments ? 'enabled' : 'disabled'}**.`,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return `Attachments from webhooks have been **${data.guildData[msg.guild.id].webhookAttachments ? 'enabled' : 'disabled'}**.`
    },
    help: {
        name: 'webhookattachments/toggleattachments',
        value: "Disables/enables Poopy's ability to attach files to webhooks, resulting in faster sending speeds."
    },
    cooldown: 2500,
    type: 'Settings'
}