module.exports = {
    name: ['battler', 'battlebricks', 'tbb'],
    args: [{
        "name": "type",
        "required": false,
        "specifarg": false,
        "orig": "[type]",
        "autocomplete": function (interaction) {
            return [
                { name: "Battlers", value: "battler" },
                { name: "Enemies", value: "enemy" }
            ]
        }
    }],
    execute: async function (msg, args) {
        let poopy = this
        let data = poopy.data
        let config = poopy.config
        let { DiscordTypes } = poopy.modules

        args[1] = args[1] ?? ' '

        if (!(
            msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) ||
            msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageWebhooks) ||
            msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageMessages) ||
            msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) ||
            msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)
        )) {
            await msg.reply('You need to have the manage webhooks/messages permission to execute that!').catch(() => { })
            return
        }

        if (!data.guildData[msg.guild.id].channels[msg.channel.id].battling) {
            if (msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageGuild) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.ManageWebhooks) || msg.member.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) || msg.author.id === msg.guild.ownerID || config.ownerids.find(id => id == msg.author.id)) {
                var battleValue = args[1] ? args[1].toLowerCase() : "battler"

                if (battleValue == "enemy" || battleValue == "enemies" || battleValue == "2") battleValue = 2
                else battleValue = 1

                data.guildData[msg.guild.id].channels[msg.channel.id].battling = battleValue

                if (!msg.nosend) await msg.reply("https://static.wikia.nocookie.net/the-battle-bricks/images/0/03/TBB_current_logo.png").catch(() => { })
                return "https://static.wikia.nocookie.net/the-battle-bricks/images/0/03/TBB_current_logo.png"
            } else {
                await msg.reply('You need to have the manage webhooks/messages permission to execute that!').catch(() => { })
                return;
            };
        } else {
            data.guildData[msg.guild.id].channels[msg.channel.id].battling = false

            if (!msg.nosend) await msg.reply("The Battle Bricks have died.").catch(() => { })
            return "The Battle Bricks have died."
        }
    },
    help: {
        name: 'battler/battlebricks/tbb [type (battler or enemy)] (manage webhooks/messages permission only)',
        value: "I'm Battler, and I'm always battling!"
    },
    cooldown: 2500,
    perms: ['Administrator',
        'ManageMessages'],
    type: 'Webhook'
}