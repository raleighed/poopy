const CryptoJS = require('crypto-js')
const Collection = require('@discordjs/collection').Collection

async function createEmbed(url, linkEmbed) {
    let poopy = this
    let vars = poopy.vars
    let { validateFile, validateFileFromPath, escapeHTML } = poopy.functions

    var fileinfo

    if (vars.validUrl.test(url)) {
        fileinfo = await validateFile(url, 'very true').catch(() => { })
    } else {
        fileinfo = await validateFileFromPath(url, 'very true').catch(() => { })
    }

    if (!fileinfo) return

    var attachHtml

    switch (fileinfo.type.mime.split('/')[0]) {
        case 'image':
            attachHtml = `<a href="${fileinfo.path}" download="${fileinfo.name}"><img alt="Image" src="${fileinfo.path}"></a>`
            break;

        case 'video':
            attachHtml = `<video controls src="${fileinfo.path}" title="${fileinfo.name}"></video>`
            break;

        case 'audio':
            if (!linkEmbed) attachHtml = `<audio controls src="${fileinfo.path}" title="${fileinfo.name}"></audio>`
            break;

        case 'text':
            if (!linkEmbed) attachHtml = escapeHTML(fileinfo.buffer.toString())
            break;

        default:
            if (!linkEmbed) attachHtml = `<a href="${fileinfo.path}" download="${fileinfo.name}">${fileinfo.name}</a>`
            break;
    }

    return attachHtml
}

async function send(payload) {
    try {
        let msg = this
        let data = msg._data
        let { req, res, poopy, messages } = data

        let { validateFileFromPath, replaceAsync, escapeHTML, getKeywordsFor } = poopy.functions
        let vars = poopy.vars
        let tempdata = poopy.tempdata

        if (typeof (payload) == 'string') {
            payload = {
                content: payload
            }
        }

        const channelData = tempdata[msg.guild?.id]?.[msg.channel?.id]

        if (channelData?.shut) return
        if (channelData?.forceres && (typeof payload == 'object' ? (
            payload.content ||
            payload.files || payload.embeds ||
            payload.stickers
        ) : payload)) {
            var forceres = channelData.forceres
            delete channelData.forceres

            var content = typeof payload == 'object' ? (payload.content ?? '') : payload
            var m = msg
            var r = await getKeywordsFor(forceres.res, m, true, {
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
                        content: r,
                        allowedMentions: {
                            parse: ['users']
                        }
                    }
                    break;
                case 'object':
                    payload.content = r
                    break;
            }
        }

        if (req.body.restype == 'json') {
            if (payload.files && payload.files.length > 0) {
                for (var i in payload.files) {
                    var attachment = payload.files[i].attachment

                    if (!vars.validUrl.test(attachment)) {
                        var fileinfo = await validateFileFromPath(attachment, 'very true').catch(() => { })

                        if (!fileinfo) continue

                        payload.files[i].attachment = fileinfo.path
                    }
                }
            }

            messages.push(payload)

            return new Message(data, payload)
        }

        let message = []

        if (req.body.restype == 'raw') {
            const attachment = (payload.files &&
                payload.files.length > 0 &&
                payload.files.find(file => file.attachment) &&
                payload.files.find(file => file.attachment).attachment)

                ||

                (payload.embeds &&
                    payload.embeds.length > 0 &&
                    payload.embeds.find(embed => embed.image) &&
                    payload.embeds.find(embed => embed.image).image &&
                    payload.embeds.find(embed => embed.image).image.url)

            if (attachment) {
                sent = true
                if (vars.validUrl.test(attachment)) {
                    res.redirect(attachment)
                } else {
                    await new Promise(resolve => res.sendFile(`${__dirname}/${attachment}`, resolve))
                    res.end()
                }
            } else {
                if (payload.content) message.push(payload.content)

                if (payload.embeds && payload.embeds.length > 0) {
                    let textEmbed = []

                    payload.embeds.forEach(embed => {
                        if (embed.author && embed.author.name) textEmbed.push(embed.author.name)
                        if (embed.title) textEmbed.push(embed.title)
                        if (embed.description) textEmbed.push(embed.description)
                        if (embed.fields && embed.fields.length > 0) textEmbed.push(embed.fields.map(field => `${field.name ?? ''}\n${field.value ?? ''}`).join('\n'))
                        if (embed.footer && embed.footer.text) textEmbed.push(embed.footer.text)
                    })

                    message.push(textEmbed.join('\n'))
                }
            }

            messages.push(message.join('\n'))

            return new Message(data, payload)
        }

        let contents = []
        let container = []

        if (payload.content) contents.push(escapeHTML(payload.content))

        if (payload.embeds && payload.embeds.length > 0) {
            let textEmbed = []

            for (var i in payload.embeds) {
                const embed = payload.embeds[i]

                if (embed.author && embed.author.name) textEmbed.push(escapeHTML(embed.author.name))
                if (embed.title) textEmbed.push(escapeHTML(embed.title))
                if (embed.description) textEmbed.push(escapeHTML(embed.description))
                if (embed.fields && embed.fields.length > 0) textEmbed.push(embed.fields.map(field => escapeHTML(`${field.name ?? ''}\n${field.value ?? ''}`)).join('\n'))
                if (embed.footer && embed.footer.text) textEmbed.push(escapeHTML(embed.footer.text))
                if (embed.thumbnail && embed.thumbnail.url) container.push(await createEmbed.call(poopy, embed.thumbnail.url))
                if (embed.image && embed.image.url) container.push(await createEmbed.call(poopy, embed.image.url))
            }

            contents.push(textEmbed.join('\n'))
        }

        if (payload.files && payload.files.length > 0) {
            for (var i in payload.files) {
                const attachment = payload.files[i].attachment
                const attachEmbed = await createEmbed.call(poopy, attachment)
                if (attachEmbed) container.push(attachEmbed)
            }
        }

        for (var i in contents) {
            var valid = 0
            contents[i] = await replaceAsync(contents[i], new RegExp(vars.validUrl, 'g'), async (url) => {
                if (valid < 10) {
                    const attachEmbed = await createEmbed.call(poopy, url, true)
                    if (attachEmbed) {
                        container.push(attachEmbed)
                        valid++
                    }
                }

                return `<a href="${url}" target="_blank">${url}</a>`
            })
        }

        if (contents.length > 0) message.push(`<div class="contents">${contents.join('')}</div>`)
        if (container.length > 0) message.push(`<div class="container">${container.join('')}</div>`)
        message = `<div class="message">${message.join('')}</div>`

        messages.push(message)

        return new Message(data, payload)
    } catch (e) { console.log(e) }
}

class Guild {
    constructor(data) {
        let { poopy } = data
        this._data = data

        let bot = poopy.bot

        this.name = `${bot.user.displayName}'s API`
        this.emojis = {
            cache: new Collection()
        }
        this.roles = {
            cache: new Collection([['Role', { name: 'Owner', id: 'Role' }]])
        }
        this.ownerId = bot.user.id
        this.id = 'API'
        this.createdTimestamp = Date.now()
        this.memberCount = 0
        this.verificationLevel = 0
    }

    get channels() {
        let channel = new Channel(this._data)
        return {
            cache: new Collection([[channel.id, channel]])
        }
    }

    get members() {
        let member = new GuildMember(this._data)
        return {
            fetch: async (id) => id == member.id && member,
            cache: new Collection([[member.id, member]])
        }
    }

    async fetchAuditLogs() {
        return {
            entries: new Collection()
        }
    }

    iconURL() {
        return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }

    bannerURL() {
        return null
    }

    splashURL() {
        return null
    }

    discoverySplashURL() {
        return null
    }
}

class Channel {
    constructor(data) {
        let { req, poopy } = data
        this._data = data

        let bot = poopy.bot

        this.owner = bot.user
        this.nsfw = false
        this.onsfw = true
        this.type = 0
        this.name = 'Channel'
        this.id = Array.from(CryptoJS.MD5(req.ip).toString()).reverse().join('')
    }

    get messages() {
        let message = new Message(this._data)
        return {
            fetch: async (id) => id == message.id && message,
            cache: new Collection([[message.id, message]])
        }
    }

    get guild() {
        return new Guild(this._data)
    }

    async fetch() {
        return this
    }

    async send(payload) {
        return send.call(this, payload)
    }

    async sendTyping() { }

    async fetchWebhooks() {
        return new Collection([[this.id, this]])
    }

    async createWebhook() {
        return this
    }

    createMessageCollector() {
        return {
            on: () => { },
            once: () => { },
            resetTimer: () => { },
            stop: () => { }
        }
    }

    permissionsFor() {
        return {
            has: () => true
        }
    }

    isDMBased() {
        return false
    }

    isTextBased() {
        return true
    }

    isThread() {
        return false
    }

    isVoiceBased() {
        return false
    }
}

class GuildMember {
    constructor(data) {
        let { req } = data
        this._data = data

        this.id = CryptoJS.MD5(req.ip).toString()
        this.nickname = 'Member'
        this.roles = {
            cache: new Collection([['Role', { name: 'Owner', id: 'Role' }]])
        }
        this.permissions = {
            has: () => true
        }
        this.joinedTimestamp = Date.now()
        this.presence = {}
    }

    get user() {
        return new User(this._data)
    }

    async send(payload) {
        return send.call(this, payload)
    }

    async fetch() {
        return this
    }

    displayAvatarURL() {
        return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }

    avatarURL() {
        return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }
}

class User {
    constructor(data) {
        let { req } = data
        this._data = data

        this.username = 'User'
        this.displayName = 'User'
        this.tag = 'User'
        this.id = CryptoJS.MD5(req.ip).toString()
        this.createdTimestamp = Date.now()
        this.flags = {
            toArray: () => []
        }
    }

    get channel() {
        return new Channel(this._data)
    }

    get dmChannel() {
        return new Channel(this._data)
    }

    async send(payload) {
        return send.call(this, payload)
    }

    async fetch() {
        return this
    }

    async createDM() {
        return new Channel(this._data)
    }

    displayAvatarURL() {
        return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }

    avatarURL() {
        return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }

    bannerURL() {
        return null
    }
}

class Message {
    constructor(data, payload) {
        let { req, poopy } = data
        this._data = data

        let { generateId } = poopy.functions

        if (payload && typeof payload == 'string') payload = { content: payload }

        this.content = payload ? payload.content : req.body.args
        this.attachments = payload ? new Collection((payload.files ?? []).map(a => [`Attachment${i++}`, {
            id: `Attachment${i++}`,
            name: a.name,
            url: a.url
        }])) : new Collection()
        this.embeds = payload ? payload.embeds : []
        this.stickers = payload ? payload.stickers : new Collection()

        this.id = generateId()
        this.type = 0
        this.bot = false
        this.mentions = {
            users: new Collection(),
            members: new Collection(),
            roles: new Collection()
        }
    }

    get author() {
        return new User(this._data)
    }

    get member() {
        return new GuildMember(this._data)
    }

    get channel() {
        return new Channel(this._data)
    }

    get guild() {
        return new Guild(this._data)
    }

    async reply(payload) {
        return send.call(this, payload)
    }

    async edit(payload) {
        return send.call(this, payload)
    }

    async delete() { }

    async react() { }

    async fetchReference() { }

    async fetchWebhook() { }

    createReactionCollector() {
        return {
            on: () => { },
            once: () => { },
            resetTimer: () => { },
            stop: () => { }
        }
    }

    createMessageComponentCollector() {
        return {
            on: () => { },
            once: () => { },
            resetTimer: () => { },
            stop: () => { }
        }
    }
}

module.exports = Message