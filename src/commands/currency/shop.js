module.exports = {
    name: ['shop'],
    args: [
        {
            "name": "type",
            "required": false,
            "specifarg": false,
            "orig": "<type (upgrades, buffs, items or shields)>",
            "autocomplete": ['upgrades', 'buffs', 'items', 'shields']
        }
    ],
    execute: async function (msg, args) {
        let poopy = this
        let { displayShops } = poopy.functions

        return await displayShops(msg, args[1]?.toLowerCase())
    },
    help: {
        name: 'shop <type (upgrades, buffs, items or shields)>',
        value: "Access the shop, and buy battle upgrades, buffs, shields, and other items from it."
    },
    cooldown: 5000,
    type: 'Currency'
}