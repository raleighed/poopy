var mongoose = require('mongoose')

module.exports = {
    botData: mongoose.model('botdata', mongoose.Schema({
        dataid: {
            type: String,
            required: true
        },

        messages: {
            type: Number,
            required: false
        },

        commands: {
            type: Number,
            required: false
        },

        filecount: {
            type: Number,
            required: false
        },

        reboots: {
            type: Number,
            required: false
        },

        users: {
            type: Array,
            required: false
        },

        leaderboard: {
            type: Object,
            required: false
        },

        crons: {
            type: Array,
            required: false
        }
    })),

    userData: mongoose.model('userdata', mongoose.Schema({
        dataid: {
            type: String,
            required: true
        },

        uid: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: false
        },

        health: {
            type: Number,
            required: false
        },

        maxHealth: {
            type: Number,
            required: false
        },

        death: {
            type: Number,
            required: false
        },

        heal: {
            type: Number,
            required: false
        },

        defense: {
            type: Number,
            required: false
        },

        attack: {
            type: Number,
            required: false
        },

        accuracy: {
            type: Number,
            required: false
        },

        loot: {
            type: Number,
            required: false
        },

        exp: {
            type: Number,
            required: false
        },

        bucks: {
            type: Number,
            required: false
        },

        dms: {
            type: Boolean,
            required: false
        },

        tokens: {
            type: Object,
            required: false
        },

        blocked: {
            type: Array,
            required: false
        }
    })),

    guildData: mongoose.model('guilddata', mongoose.Schema({
        dataid: {
            type: String,
            required: true
        },

        gid: {
            type: String,
            required: true
        },

        chaincommands: {
            type: Boolean,
            required: false
        },

        webhookAttachments: {
            type: Boolean,
            required: false
        },

        prefix: {
            type: String,
            required: false
        },

        allMembers: {
            type: Object,
            required: false
        },

        messages: {
            type: Array,
            required: false
        },

        disabled: {
            type: Array,
            required: false
        },

        restricted: {
            type: Array,
            required: false
        },

        read: {
            type: Array,
            required: false
        },

        localcmds: {
            type: Array,
            required: false
        },

        joins: {
            type: Number,
            required: false
        },

        lastuse: {
            type: Number,
            required: false
        },

        keyexec: {
            type: Number,
            required: false
        }
    })),

    channelData: mongoose.model('channeldata', mongoose.Schema({
        dataid: {
            type: String,
            required: true
        },

        gid: {
            type: String,
            required: true
        },

        cid: {
            type: String,
            required: true
        },

        read: {
            type: Boolean,
            required: false
        },

        nsfw: {
            type: Boolean,
            required: false
        },

        lastUrls: {
            type: Array,
            required: false
        },

        lastuse: {
            type: Number,
            required: false
        }
    })),

    memberData: mongoose.model('memberdata', mongoose.Schema({
        dataid: {
            type: String,
            required: true
        },

        gid: {
            type: String,
            required: true
        },

        uid: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: false
        },

        coolDown: {
            type: Number,
            required: false
        },

        messages: {
            type: Number,
            required: false
        },

        lastmessage: {
            type: Number,
            required: false
        }
    })),

    globalData: mongoose.model('globaldata', mongoose.Schema({
        commandTemplates: {
            type: Array,
            required: false
        },

        shit: {
            type: Array,
            required: false
        },
        
        psfiles: {
            type: Array,
            required: false
        },
        
        pspasta: {
            type: Array,
            required: false
        },
        
        funnygif: {
            type: Array,
            required: false
        },
        
        poop: {
            type: Array,
            required: false
        },
        
        dmphrases: {
            type: Array,
            required: false
        },
        
        shitting: {
            type: Array,
            required: false
        },
    }))
}