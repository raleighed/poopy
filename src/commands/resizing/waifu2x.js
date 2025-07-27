module.exports = {
    name: ['waifu2x'],
    args: [{ "name": "image", "required": true, "specifarg": false, "orig": "<image>" }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules
        let vars = poopy.vars
        let { axios, fs, FormData } = poopy.modules

        await msg.channel.sendTyping().catch(() => { })
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        };
        var currenturl = lastUrl(msg, 0) || args[1]

        var fileinfo = await validateFile(currenturl).catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return;
        })

        if (!fileinfo) return
        var type = fileinfo.type

        if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            var filepath = await downloadFile(currenturl, `input.png`, {
                fileinfo
            })
            var filename = `input.png`
            await execPromise(`ffmpeg -i ${filepath}/${filename} -vf alphaextract -preset ${findpreset(args)} ${filepath}/mask.png`)

            var formData = new FormData()
            formData.append('image', fs.createReadStream(`${filepath}/${filename}`))
            var formDataMask = new FormData()
            formDataMask.append('image', fs.createReadStream(`${filepath}/mask.png`))

            var resp = await axios({
                url: "https://api.deepai.org/api/waifu2x",
                method: "POST",
                headers: {
                    "api-key": process.env.DEEPAI_KEY
                },
                data: formData
            }).catch((e) => console.log(e))
            var maskresp = await axios({
                url: "https://api.deepai.org/api/waifu2x",
                method: "POST",
                headers: {
                    "api-key": process.env.DEEPAI_KEY
                },
                data: formDataMask
            }).catch((e) => console.log(e))

            if (!resp || !maskresp) {
                await msg.reply(`Couldn't process file.`)
                return
            }

            await downloadFile(resp.output_url, `waifu2xinput.png`, {
                filepath: filepath,
                ffmpeg: true
            })
            await downloadFile(maskresp.output_url, `waifu2xmask.png`, {
                filepath: filepath,
                ffmpeg: true
            })

            await execPromise(`ffmpeg -i ${filepath}/waifu2xinput.png -i ${filepath}/waifu2xmask.png -filter_complex "[0:v][1:v]alphamerge[out]" -map "[out]" -preset ${findpreset(args)} ${filepath}/output.png`)
            return await sendFile(msg, filepath, `output.png`)
        } else {
            await msg.reply({
                content: `Unsupported file: \`${currenturl}\``,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        }
    },
    help: {
        name: 'waifu2x <image>',
        value: 'Upscales the image and reduces its noise with Waifu2x. Try it yourself at http://waifu2x.udp.jp/'
    },
    cooldown: 2500,
    type: 'Resizing',
    envRequired: ['DEEPAI_KEY']
}