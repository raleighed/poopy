module.exports = {
    name: ['toggledms', 'tdms'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let data = poopy.data
        let { fetchPingPerms } = poopy.functions

        data.userData[msg.author.id].dms = !data.userData[msg.author.id].dms
        if (!msg.nosend) await msg.reply({
            content: `Unrelated DMs from \`dm\` will **${!data.userData[msg.author.id].dms ? 'not ' : ''}be sent** to you now.`,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(() => { })
        return `Unrelated DMs from \`dm\` will **${!data.userData[msg.author.id].dms ? 'not ' : ''}be sent** to you now.`
    },
    help: {
        name: 'toggledms/tdms',
        value: "Disables/enables Poopy's ability to send you DMs through the `dm` command."
    },
    cooldown: 2500,
    type: 'Settings'
}