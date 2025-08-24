module.exports = {
    name: ['shields', 'viewshields'],
    args: [],
    execute: async function (msg, args) {
        let poopy = this
        let bot = poopy.bot 
        let data = poopy.data
        let json = poopy.json
        let config = poopy.config
        let { getShieldById, getShieldStatsAsEmbedFields, chunkArray,
            dmSupport, queryPage } = poopy.functions
        let { Discord, DiscordTypes } = poopy.modules

        var prefix = data.guildData[msg.channel.guild.id].prefix

        var shields = json.shieldJSON

        var userData = data.userData[msg.author.id]
        var ownedShields = shields.filter(shield => userData.shieldsOwned.includes(shield.id))

        var isShielded = userData.shielded
        var equippedShieldId = userData.shieldEquipped

        var equippedShield = getShieldById(equippedShieldId)

        var navigationButtonsData = [
            {
                emoji: '861253229723123762',
                reactemoji: '⏮',
                customid: 'first',
                style: DiscordTypes.ButtonStyle.Primary,
            },

            {
                emoji: '861253229726793728',
                reactemoji: '⬅',
                customid: 'previous',
                style: DiscordTypes.ButtonStyle.Primary,
            },

            {
                emoji: '861253229798621205',
                reactemoji: '➡',
                customid: 'next',
                style: DiscordTypes.ButtonStyle.Primary,
            },

            {
                emoji: '861253229740556308',
                reactemoji: '⏭',
                customid: 'last',
                style: DiscordTypes.ButtonStyle.Primary,
            },

            {
                emoji: '970292877785727036',
                reactemoji: '🔢',
                customid: 'page',
                style: DiscordTypes.ButtonStyle.Primary,
            },
            
            {
                customid: 'equip',
                style: DiscordTypes.ButtonStyle.Success,
                label: 'Equip'
            },
        ]

        var shieldsObject = {}
        var shieldsMsg

        var currentIndex = 0
        if (equippedShield)
            currentIndex = ownedShields.findIndex(shield => shield.id === equippedShieldId)
        var currentShield = ownedShields[currentIndex]
        var currentShieldIsEquipped = currentShield == equippedShield
        var maxIndex = ownedShields.length - 1

        var usingReactions = config.useReactions
        var usingComponents = !usingReactions
        var ended = false
        var textContent

        async function updateShield() {
            ownedShields = shields.filter(shield => userData.shieldsOwned.includes(shield.id))
            maxIndex = ownedShields.length - 1
            currentIndex = Math.max(Math.min(currentIndex, maxIndex), 0)

            isShielded = userData.shielded
            equippedShieldId = userData.shieldEquipped
            equippedShield = getShieldById(equippedShieldId)

            currentShield = ownedShields[currentIndex]
            currentShieldIsEquipped = currentShield == equippedShield

            var currentShieldImageFileName = `${currentShield.id}.png`
            var currentShieldImagePath = `assets/image/shields/${currentShieldImageFileName}`

            shieldsObject.files = [new Discord.AttachmentBuilder(currentShieldImagePath)]

            var shieldStats = getShieldStatsAsEmbedFields(currentShield)

            var components = []
            var chunkButtonData = chunkArray(navigationButtonsData, 5)

            if (usingComponents) {
                chunkButtonData.forEach(buttonsData => {
                    var buttonRow = new Discord.ActionRowBuilder()
                    var buttons = []

                    buttonsData.forEach(bdata => {
                        var button = new Discord.ButtonBuilder()
                            .setStyle(bdata.style)
                            .setCustomId(bdata.customid)

                        if (bdata.label)
                            button = button.setLabel(bdata.label)

                        if (bdata.emoji)
                            button = button.setEmoji(bdata.emoji)

                        if (bdata.customid == 'equip' && currentShieldIsEquipped)
                            button = button.setDisabled(true)

                        buttons.push(button)
                    })

                    buttonRow.addComponents(buttons)

                    components.push(buttonRow)
                })
            }

            var shieldStates = []

            if (currentShieldIsEquipped) {
                shieldStates.push("Equipped")

                if (isShielded)
                    shieldStates.push("Up")
            }

            var shieldStateString = shieldStates.join(", ")
            var shieldNameWithState = `${currentShield.name}` +
            (shieldStateString.length > 0 ? ` *(${shieldStateString})*` : '')
            var shieldMenuName = 'Owned Shields'

            var currentPageIndex = currentIndex + 1
            var lastPageIndex = maxIndex + 1
            var titleBarStatus = `(${currentPageIndex} / ${lastPageIndex})`

            textContent = `**${shieldMenuName}** ${titleBarStatus}` +
                `**${shieldNameWithState}**` + '\n\n' +
                shieldStats.map((field) => `**${field.name}**: ${field.value}`).join('\n')

            if (!config.textEmbeds) {
                shieldsObject.embeds = [{
                    author: {
                        name: shieldMenuName + ' ' + titleBarStatus
                    },
                    title: shieldNameWithState,
                    description: currentShield.description,
                    color: 0x472604,
                    thumbnail: { url: `attachment://${currentShieldImageFileName}` },
                    footer: {
                        icon_url: bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                        text: bot.user.displayName
                    },
                    fields: shieldStats
                }]
            } else {
                shieldsObject.content = textContent
            }

            if (ended) {
                if (usingReactions) shieldsMsg.reactions.removeAll().catch(() => { })
                else shieldsObject.components = []
            } else if (usingComponents) shieldsObject.components = components

            if (shieldsMsg) shieldsMsg.edit(shieldsObject).catch(() => { })
        }

        await updateShield().catch((e) => console.log(e))

        shieldsMsg = await msg.reply(shieldsObject).catch(() => { })

        if (!shieldsMsg) throw new Error(`Couldn't send shop to channel`)
        var collector
        
        if (usingReactions)
            collector = shieldsMsg.createReactionCollector({ time: 60_000 })
        else
            collector = shieldsMsg.createMessageComponentCollector({ time: 60_000 })

        collector.on('collect', async (button, user) => {
            dmSupport(button)

            if (usingComponents)
                user = button.user

            var userSameAsCaller = user.id === msg.member.id
            var userIsntBot = user.id !== bot.user.id && !user.bot

            if (!(userSameAsCaller && (userIsntBot || config.allowbotusage))) {
                if (usingComponents)
                    button.deferUpdate().catch(() => { })
                return
            }

            var customid
            if (usingComponents)
                customid = button.customId
            else
                customid = navigationButtonsData.find(buttonData => buttonData.reactemoji === button.emoji.name)

            if (!customid)
                return

            collector.resetTimer()

            var alreadyEquippedText = 'You already equipped that.'

            async function replyGeneric(text, flags) {
                if (usingComponents) {
                    var replyData = {
                        content: text
                    }

                    if (flags)
                        replyData.flags = flags

                    await button.reply(replyData).catch((e) => console.log(e))
                }
                else
                    await channel.send(text).catch((e) => { console.log(e) })
            }

            async function deferUpdate() {
                if (usingComponents)
                    button.deferUpdate().catch(() => { })
            }

            switch (customid) {
                case 'equip':
                    if (currentShieldIsEquipped) {
                        replyGeneric(alreadyEquippedText, Discord.MessageFlags.Ephemeral)
                        return
                    }

                    userData.shieldEquipped = currentShield.id

                    replyGeneric(`**${currentShield.name}** equipped. Put your shield up/down using \`${prefix}shield\`.`)

                    await updateShield().catch(() => { })
                    return

                case 'first':
                    deferUpdate()
                    currentIndex = 0
                    await updateShield().catch((e) => console.log(e))
                    break

                case 'previous':
                    deferUpdate()
                    currentIndex = Math.max(currentIndex - 1, 0)
                    await updateShield().catch((e) => console.log(e))
                    break

                case 'next':
                    deferUpdate()
                    currentIndex = Math.min(currentIndex + 1, maxIndex)
                    await updateShield().catch((e) => console.log(e))
                    break

                case 'last':
                    deferUpdate()
                    currentIndex = maxIndex
                    await updateShield().catch((e) => console.log(e))
                    break

                case 'page':
                    queryPage(msg.channel, msg.member.id, currentIndex + 1, maxIndex + 1, button).then(async (newPage) => {
                        currentIndex = newPage - 1
                        await updateShield().catch((e) => console.log(e))
                    }).catch((e) => console.log(e))
                    break
            }
        })

        collector.on('end', async (_, reason) => {
            ended = reason
            await updateShield().catch((e) => console.log(e))
        })

        if (usingReactions) {
            for (var buttonData of navigationButtonsData) {
                await shieldsMsg.react(buttonData.reactemoji).catch(() => { })
            }
        }

        return textContent
    },
    help: {
        name: 'shields',
        value: "View a list of your owned shields and equip whichever one you want."
    },
    cooldown: 5000,
    type: 'Battling'
}