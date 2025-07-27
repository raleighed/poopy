module.exports = {
    name: ['specialkeys', 'keywords', 'functions'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let config = poopy.config
        let bot = poopy.bot
        let { navigateEmbed } = poopy.functions
        let vars = poopy.vars

        var dmChannel = await msg.author.createDM().catch(() => { })

        if (dmChannel) {
            if (!msg.nosend) {
                if (config.textEmbeds) await dmChannel.send(`> **WHAT are keywords and functions?**\nKeywords and functions are special words that can be used in any command which are replaced with something new (keywords), or generate something new with the arguments inside their parentheses (functions), depending on their purpose. This sort of works like a programming language for the bot.\n\n> **Example Usages**\n\`\`\`\np:say _member really likes _member\n\`\`\`\n\`\`\`\np:img _word\n\`\`\`\n\`\`\`\np:meme4 "lower(_sentence)"\n\`\`\`\n\`\`\`\np:meme4 "lower(_member), the upper(_arab)!"\n\`\`\`\n\`\`\`\np:spam 25 _sayori\n\`\`\`\n\`\`\`\np:say choice(da minion | da bob)\n\`\`\`\n\n> **Command Templates**\n` + "Speech Bubble\n```\ncommand(vmerge | https://cdn.discordapp.com/attachments/760223418968047629/938887195471786034/unknown.png lasturl())\n```\nSquare Crop\n```\ncommand(crop | declare(url | lasturl()) declare(width | width({url})) declare(height | height({url})) declare(biggest | if(equal({width} | {height}) | both | if(bigger({width} | {height}) | width | height))) {url} if(notequal({biggest} | both) | -x if(equal({biggest} | width) | math({width} / 2 - {height} / 2) | 0) -y if(equal({biggest} | height) | math({height} / 2 - {width} / 2) | 0) -w if(equal({biggest} | width) | {height} | {width}) -h if(equal({biggest} |height) | {width} | {height})))\n```\nHerobrine\n```\ncommand(overlay | https://cdn.discordapp.com/attachments/879658786376265768/930909703595253810/herobrines.png lasturl() -origin center bottom -offsetpos -135 -221 -width 30 -height 30 -keepaspectratio increase)\n```").catch(async () => {
                    await msg.reply('Couldn\'t send info to you. Do you have me blocked?').catch(() => { })
                    return
                })
                else await dmChannel.send({
                    embeds: [{
                        "title": 'Special Keywords/Functions',
                        "color": 0x472604,
                        "footer": {
                            icon_url: bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            text: bot.user.displayName
                        },
                        "fields": [
                            {
                                "name": "WHAT are keywords and functions?",
                                "value": "Keywords and functions are special words that can be used in any command which are replaced with something new (keywords), or generate something new with the arguments inside their parentheses (functions), depending on their purpose. This sort of works like a programming language for the bot.",
                            },
                            {
                                "name": "Example Usages",
                                "value": "```\np:say _member really likes _member\n```\n```\np:img _word\n```\n```\np:meme4 \"lower(_sentence)\"\n```\n```\np:meme4 \"lower(_member), the upper(_arab)!\"\n```\n```\np:spam 25 _sayori\n```\n```\np:say choice(da minion | da bob)\n```",
                            },
                            {
                                "name": "Templates",
                                "value": "Speech Bubble\n```\ncommand(vmerge | https://cdn.discordapp.com/attachments/760223418968047629/938887195471786034/unknown.png lasturl())\n```\nSquare Crop\n```\ncommand(crop | declare(url | lasturl()) declare(width | width({url})) declare(height | height({url})) declare(biggest | if(equal({width} | {height}) | both | if(bigger({width} | {height}) | width | height))) {url} if(notequal({biggest} | both) | -x if(equal({biggest} | width) | math({width} / 2 - {height} / 2) | 0) -y if(equal({biggest} | height) | math({height} / 2 - {width} / 2) | 0) -w if(equal({biggest} | width) | {height} | {width}) -h if(equal({biggest} |height) | {width} | {height})))\n```\nHerobrine\n```\ncommand(overlay | https://cdn.discordapp.com/attachments/879658786376265768/930909703595253810/herobrines.png lasturl() -origin center bottom -offsetpos -135 -221 -width 30 -height 30 -keepaspectratio increase)\n```"
                            }
                        ]
                    }]
                }).catch(async () => {
                    await msg.reply('Couldn\'t send info to you. Do you have me blocked?').catch(() => { })
                    return
                })

                await navigateEmbed(dmChannel, async (page) => {
                    if (config.textEmbeds) return `${vars.keyfields[page - 1].map(k => `\`${k.name}\`\n> ${k.value}`).join('\n').replace(new RegExp(vars.validUrl, 'g'), (url) => `<${url}>`)}\n\nPage ${page}/${vars.keyfields.length}`
                    else return {
                        "title": `Special Keywords`,
                        "description": "Here's a list of all keywords that can be used.",
                        "color": 0x472604,
                        "footer": {
                            "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            "text": `Page ${page}/${vars.keyfields.length}`
                        },
                        "fields": vars.keyfields[page - 1]
                    }
                }, vars.keyfields.length, msg.author.id, undefined, undefined, undefined, true, undefined, undefined, true).catch(async () => {
                    await msg.reply('Couldn\'t send keywords to you. Do you have me blocked?').catch(() => { })
                    return
                })

                await navigateEmbed(dmChannel, async (page) => {
                    if (config.textEmbeds) return `${vars.funcfields[page - 1].map(k => `\`${k.name}\`\n> ${k.value}`).join('\n').replace(new RegExp(vars.validUrl, 'g'), (url) => `<${url}>`)}\n\nPage ${page}/${vars.keyfields.length}`
                    else return {
                        "title": `Special Functions`,
                        "description": "Here's a list of all functions that can be used.",
                        "color": 0x472604,
                        "footer": {
                            "icon_url": bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' }),
                            "text": `Page ${page}/${vars.funcfields.length}`
                        },
                        "fields": vars.funcfields[page - 1]
                    }
                }, vars.funcfields.length, msg.author.id, undefined, undefined, undefined, true, undefined, undefined, true).catch(async () => {
                    await msg.reply('Couldn\'t send functions to you. Do you have me blocked?').catch(() => { })
                    return
                })

                await msg.reply('✅ Check your DMs.').catch(() => { })
            }

            return `> **WHAT are keywords and functions?**\nKeywords and functions are special words that can be used in any command which are replaced with something new (keywords), or generate something new with the arguments inside their parentheses (functions), depending on their purpose. This sort of works like a programming language for the bot.\n\n> **Example Usages**\n\`\`\`\np:say _member really likes _member\n\`\`\`\n\`\`\`\np:img _word\n\`\`\`\n\`\`\`\np:meme4 "lower(_sentence)"\n\`\`\`\n\`\`\`\np:meme4 "lower(_member), the upper(_arab)!"\n\`\`\`\n\`\`\`\np:spam 25 _sayori\n\`\`\`\n\`\`\`\np:say choice(da minion | da bob)\n\`\`\`\n\n> **Command Templates**\n` + "Speech Bubble\n```\ncommand(vmerge | https://cdn.discordapp.com/attachments/760223418968047629/938887195471786034/unknown.png lasturl())\n```\nSquare Crop\n```\ncommand(crop | declare(url | lasturl()) declare(width | width({url})) declare(height | height({url})) declare(biggest | if(equal({width} | {height}) | both | if(bigger({width} | {height}) | width | height))) {url} if(notequal({biggest} | both) | -x if(equal({biggest} | width) | math({width} / 2 - {height} / 2) | 0) -y if(equal({biggest} | height) | math({height} / 2 - {width} / 2) | 0) -w if(equal({biggest} | width) | {height} | {width}) -h if(equal({biggest} |height) | {width} | {height})))\n```\nHerobrine\n```\ncommand(overlay | https://cdn.discordapp.com/attachments/879658786376265768/930909703595253810/herobrines.png lasturl() -origin center bottom -offsetpos -135 -221 -width 30 -height 30 -keepaspectratio increase)\n```"
        } else {
            await msg.reply('Couldn\'t send info to you. Do you have me blocked?').catch(() => { })
        }
    },
    help: {
        name: 'specialkeys/keywords/functions',
        value: 'DMs you a list of special keywords that can be used for all commands, and some info about them.'
    },
    cooldown: 2500,
    type: 'Unique'
}