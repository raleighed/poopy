module.exports = {
    name: ['slam'],
    args: [{
        "name": "subject", "required": true, "specifarg": false, "orig": "<subject>",
        "autocomplete": async function (interaction) {
            let poopy = this
            let { data, config } = poopy
            let { dataGather } = poopy.functions

            if (!data.guildData[interaction.guild.id]) {
                data.guildData[interaction.guild.id] = !config.testing && process.env.MONGODB_URL && await dataGather.guildData(config.database, interaction.guild.id).catch((e) => console.log(e)) || {}
            }

            var memberData = data.guildData[interaction.guild.id].allMembers ?? {}
            var memberKeys = Object.keys(memberData).sort((a, b) => memberData[b].messages - memberData[a].messages)

            return memberKeys.map(id => {
                return { name: memberData[id].username, value: id }
            })
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let { battle } = poopy.functions
        var action = '**{src}** slammed **{trgt}**! It did **{dmg}** damage!'
        var damage = 30
        var chance = 1 / 4

        return await battle(msg, args.slice(1).join(' '), action, damage, chance)
    },
    help: {
        name: 'slam <subject>',
        value: 'Slam something! Has a high chance of missing.'
    },
    type: 'Battling'
}