let modules = {}
let activeBots = require('./dataValues').activeBots

modules.Discord = [require('discord.js'), require('discord.js-selfbot-v13')]
modules.DiscordTypes = require('discord-api-types/v10')

modules.fs = require('fs-extra')
modules.nodefs = require('fs')
modules.archiver = require('archiver')
modules.fileType = require('file-type')
modules.axios = require('axios')
modules.request = require('request')
modules.FormData = require('form-data')
modules.cheerio = require('cheerio')
modules.xml2json = require('xml2js').parseStringPromise
modules.util = require('util')
modules.cron = require('cron')
modules.CryptoJS = require('crypto-js')
if (modules.fs.existsSync('node_modules/@jimp/plugin-print'))
    modules.fs.rmSync('node_modules/@jimp/plugin-print', {
        force: true, recursive: true
    })
if (!modules.fs.existsSync('node_modules/@jimp/plugin-print'))
    modules.fs.copySync('lib/plugin-print', 'node_modules/@jimp/plugin-print', {
        recursive: true
    })
modules.Jimp = require('jimp')
modules.whatwg = require('whatwg-url')
modules.catbox = require('catbox.moe')
modules.gis = require('g-i-s')
modules.mathjs = require('mathjs')
modules.prettyBytes = require('pretty-bytes')
modules.pluralize = require('pluralize')
modules.itob = require('istextorbinary')
modules.os = require('os')
modules.Collection = require('@discordjs/collection').Collection
modules.Rainmaze = require('../lib/rainmaze/Rainmaze')
modules.APIMessage = require('./apiMessage')
modules.DMGuild = class DMGuild {
    constructor(msg) {
        let members = new modules.Collection([[msg.client.user.id, msg.client.user]].concat(
            msg.channel.recipients ?
                [...msg.channel.recipients] :
                msg.channel.recipient ?
                    [[msg.channel.recipient.id, msg.channel.recipient]] :
                    [[msg.author.id, msg.author]]
        ))

        this.ownerId = msg.channel.ownerId || msg.channel.recipient?.id || msg.author?.id || msg.id
        this.id = msg.channel.id
        this.name = msg.channel.name || `${(msg.user || msg.author).displayName}'s DMs`
        this.fetchAuditLogs = async () => {
            return {
                entries: new modules.Collection()
            }
        }
        this.emojis = {
            cache: new modules.Collection()
        }
        this.channels = {
            cache: new modules.Collection([[msg.channel.id, msg.channel]])
        }
        this.members = {
            fetch: async (id) => members.get(id),
            resolve: (id) => members.get(id),
            cache: members,
            me: members.get(msg.client.user.id)
        }
    }
}

for (var Discord of modules.Discord) {
    const Channel = Discord.BaseGuildTextChannel
    const channelSend = Channel.prototype.send

    Channel.prototype.send = async function send(payload) {
        var channel = this
        let client = channel.client
        let poopy = activeBots[client.database]
        let tempdata = poopy.tempdata
        let {
            waitMessageCooldown,
            setMessageCooldown,
            getKeywordsFor
        } = poopy.functions

        await waitMessageCooldown()

        const channelData = tempdata[channel.guild?.id]?.[channel.id]

        if (channelData?.shut) return
        if (channelData?.forceres && (typeof payload == 'object' ? (
            payload.content ||
            payload.files || payload.embeds ||
            payload.stickers
        ) : payload) && !channelData.forceres.repliesonly) {
            var forceres = channelData.forceres
            delete channelData.forceres

            var content = typeof payload == 'object' ? (payload.content ?? '') : payload
            var msg = forceres.msg
            var res = await getKeywordsFor(forceres.res, msg, true, {
                resetattempts: true,
                extrakeys: {
                    _msg: {
                        func: async () => {
                            return content
                        }
                    }
                }
            }).catch(() => { }) ?? forceres.res

            if (forceres.persist && !channelData.forceres) channelData.forceres = forceres

            switch (typeof payload) {
                case 'string':
                    payload = {
                        content: res,
                        allowedMentions: {
                            parse: ['users']
                        }
                    }
                    break;
                case 'object':
                    payload.content = res
                    break;
            }
        }

        return channelSend.call(channel, payload).then(setMessageCooldown)
    }

    const Message = Discord.Message
    const messageReply = Message.prototype.reply

    Message.prototype.reply = async function reply(payload) {
        var message = this
        let client = message.client
        let poopy = activeBots[client.database]
        let config = poopy.config
        let tempdata = poopy.tempdata
        let {
            waitMessageCooldown,
            setMessageCooldown,
            getKeywordsFor
        } = poopy.functions

        await waitMessageCooldown()

        const channelData = tempdata[message.guild?.id]?.[message.channel.id]

        if (channelData?.shut) return
        if (channelData?.forceres && (typeof payload == 'object' ? (
            payload.content ||
            payload.files || payload.embeds ||
            payload.stickers
        ) : payload) && !channelData.forceres.repliesonly) {
            var forceres = channelData.forceres
            delete channelData.forceres

            var content = typeof payload == 'object' ? (payload.content ?? '') : payload
            var msg = message
            var res = await getKeywordsFor(forceres.res, msg, true, {
                resetattempts: true,
                extrakeys: {
                    _msg: {
                        func: async () => {
                            return content
                        }
                    }
                }
            }).catch(() => { }) ?? forceres.res

            if (forceres.persist && !channelData.forceres) channelData.forceres = forceres

            switch (typeof payload) {
                case 'string':
                    payload = {
                        content: res,
                        allowedMentions: {
                            parse: ['users']
                        }
                    }
                    break;
                case 'object':
                    payload.content = res
                    break;
            }
        }

        if (config.allowbotusage || message.replied) return message.channel.send(payload).then(setMessageCooldown)
        else {
            var reply = await messageReply.call(message, payload).then(setMessageCooldown)
            Object.defineProperty(message, 'replied', {
                value: reply,
                writable: true
            })
            return reply
        }
    }

    const Interaction = Discord.CommandInteraction
    const interactionReply = Interaction?.prototype?.reply

    if (interactionReply) {
        Interaction.prototype.reply = async function reply(payload) {
            var interaction = this
            let client = interaction.client
            let poopy = activeBots[client.database]
            let config = poopy.config
            let tempdata = poopy.tempdata
            let {
                waitMessageCooldown,
                setMessageCooldown,
                getKeywordsFor
            } = poopy.functions

            await waitMessageCooldown()

            const channelData = tempdata[interaction.guild?.id]?.[interaction.channel.id]

            if (channelData?.shut) return
            if (channelData?.forceres && (typeof payload == 'object' ? (
                payload.content ||
                payload.files || payload.embeds ||
                payload.stickers
            ) : payload) && !channelData.forceres.repliesonly) {
                var forceres = channelData.forceres
                delete channelData.forceres

                var content = typeof payload == 'object' ? (payload.content ?? '') : payload
                var msg = interaction
                var res = await getKeywordsFor(forceres.res, msg, true, {
                    resetattempts: true,
                    extrakeys: {
                        _msg: {
                            func: async () => {
                                return content
                            }
                        }
                    }
                }).catch(() => { }) ?? forceres.res

                if (forceres.persist && !channelData.forceres) channelData.forceres = forceres

                switch (typeof payload) {
                    case 'string':
                        payload = {
                            content: res,
                            allowedMentions: {
                                parse: ['users']
                            }
                        }
                        break;
                    case 'object':
                        payload.content = res
                        break;
                }
            }

            if (config.allowbotusage || interaction.replied) return interaction.channel.send(payload).then(setMessageCooldown)
            else {
                var reply = await (!interaction.replied && interaction.deferred ?
                    interaction.editReply(payload) :
                    interactionReply.call(interaction, payload)).then(setMessageCooldown)
                Object.defineProperty(interaction, 'replied', {
                    value: reply,
                    writable: true
                })
                return reply
            }
        }
    }
}

if (process.env.GOOGLE_KEY) modules.google = require('googleapis').google

module.exports = modules
