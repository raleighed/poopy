module.exports = {
    name: ['shield'],
    args: [],
    execute: async function (msg, args) {
        let poopy = this
        let data = poopy.data
        let { getShieldById  } = poopy.functions

        var userData = data.userData[msg.author.id]

        var isShielded = !userData.shielded
        userData.shielded = isShielded
        var newState = isShielded ? "up" : "down"

        var equippedShield = getShieldById(userData.shieldEquipped)

        var response = `Your ${equippedShield.name} is now **${newState}**.`

        if (!msg.nosend)
            await msg.reply(response).catch(() => { })

        return response
    },
    help: {
        name: 'shield',
        value: "Put your equipped shield up or down. Check your shields using the `shields` command."
    },
    cooldown: 1000,
    type: 'Battling'
}