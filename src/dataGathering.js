const mongoose = require('mongoose')
const schemas = require('./schemas')
let requests = 0

module.exports = {
    botData: async (dataid) => {
        var botData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobject = await schemas.botData.findOne({ dataid }).then(d => d.toJSON()).catch(() => { })

        if (dataobject) {
            for (var k in dataobject) {
                var value = dataobject[k]
                if ((schemas.botData.schema.obj[k] ?? { required: true }).required) continue
                botData[k] = value
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return botData
    },

    userData: async (dataid, uid) => {
        var userData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobject = await schemas.userData.findOne({ dataid, uid }).then(d => d.toJSON()).catch(() => { })

        if (dataobject) {
            for (var k in dataobject) {
                var value = dataobject[k]
                if ((schemas.userData.schema.obj[k] ?? { required: true }).required) continue
                userData[k] = value
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return userData
    },

    guildData: async (dataid, gid) => {
        var guildData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobject = await schemas.guildData.findOne({ dataid, gid }).then(d => d.toJSON()).catch(() => { })

        if (dataobject) {
            for (var k in dataobject) {
                var value = dataobject[k]
                if ((schemas.guildData.schema.obj[k] ?? { required: true }).required) continue
                guildData[k] = value
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return guildData
    },

    channelData: async (dataid, gid, cid) => {
        var channelData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobject = await schemas.channelData.findOne({ dataid, gid, cid }).then(d => d.toJSON()).catch(() => { })

        if (dataobject) {
            for (var k in dataobject) {
                var value = dataobject[k]
                if ((schemas.channelData.schema.obj[k] ?? { required: true }).required) continue
                channelData[k] = value
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return channelData
    },

    allChannelData: async (dataid, gid) => {
        var channelData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobjects = await schemas.channelData.find({ dataid, gid }).then(arr => arr.map(d => d.toJSON())).catch(() => { })

        if (dataobjects) {
            for (var dataobject of dataobjects) {
                var cid = dataobject.cid
                channelData[cid] = {}
                for (var k in dataobject) {
                    var value = dataobject[k]
                    if ((schemas.channelData.schema.obj[k] ?? { required: true }).required) continue
                    channelData[cid][k] = value
                }
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return channelData
    },

    memberData: async (dataid, gid, uid) => {
        var memberData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobject = await schemas.memberData.findOne({ dataid, gid, uid }).then(d => d.toJSON()).catch(() => { })

        if (dataobject) {
            for (var k in dataobject) {
                var value = dataobject[k]
                if ((schemas.memberData.schema.obj[k] ?? { required: true }).required) continue
                memberData[k] = value
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return memberData
    },

    allMemberData: async (dataid, gid) => {
        var memberData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobjects = await schemas.memberData.find({ dataid, gid }).then(arr => arr.map(d => d.toJSON())).catch(() => { })

        if (dataobjects) {
            for (var dataobject of dataobjects) {
                var uid = dataobject.uid
                memberData[uid] = {}
                for (var k in dataobject) {
                    var value = dataobject[k]
                    if ((schemas.memberData.schema.obj[k] ?? { required: true }).required) continue
                    memberData[uid][k] = value
                }
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return memberData
    },

    globalData: async () => {
        var globalData = {}

        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var dataobject = await schemas.globalData.findOne({}).then(d => d.toJSON()).catch(() => { })

        if (dataobject) {
            for (var k in dataobject) {
                var value = dataobject[k]
                if ((schemas.globalData.schema.obj[k] ?? { required: true }).required) continue
                globalData[k] = value
            }
        }

        requests--
        if (requests <= 0) mongoose.connection.close()

        return globalData
    },

    update: async (dataid, d) => {
        var url = process.env.MONGODB_URL
        if (requests <= 0) await mongoose.connect(url)
        requests++

        var data = d.data

        var botData = data.botData
        await schemas.botData.findOneAndUpdate({ dataid }, botData, {
            upsert: true,
            useFindAndModify: false
        }).catch(() => { })

        var userData = data.userData
        for (var uid in userData) {
            var user = userData[uid]
            await schemas.userData.findOneAndUpdate({ dataid, uid }, user, {
                upsert: true,
                useFindAndModify: false
            }).catch(() => { })
        }

        var guildData = data.guildData
        for (var gid in guildData) {
            var guild = { ...guildData[gid] }

            var channelData = guild.channels
            delete guild.channels
            for (var cid in channelData) {
                var channel = channelData[cid]
                await schemas.channelData.findOneAndUpdate({ dataid, gid, cid }, channel, {
                    upsert: true,
                    useFindAndModify: false
                }).catch(() => { })
            }

            var memberData = guild.members
            delete guild.members
            for (var uid in memberData) {
                var member = memberData[uid]
                await schemas.memberData.findOneAndUpdate({ dataid, gid, uid }, member, {
                    upsert: true,
                    useFindAndModify: false
                }).catch(() => { })
            }

            await schemas.guildData.findOneAndUpdate({ dataid, gid }, guild, {
                upsert: true,
                useFindAndModify: false
            }).catch(() => { })
        }

        var globaldata = d.globaldata

        if (globaldata) await schemas.globalData.findOneAndUpdate({}, globaldata, {
            upsert: true,
            useFindAndModify: false
        }).catch(() => { })

        requests--
        if (requests <= 0) mongoose.connection.close()
    }
}