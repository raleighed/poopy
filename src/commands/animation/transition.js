module.exports = {
    name: ['transition'],
    args: [{
        "name": "transition",
        "required": false,
        "specifarg": false,
        "orig": "{transition (default is fade)}",
        "autocomplete": [
            'fade',
            'wipeleft',
            'wiperight',
            'wipeup',
            'wipedown',
            'slideleft',
            'slideright',
            'slideup',
            'slidedown',
            'circlecrop',
            'rectcrop',
            'distance',
            'fadeblack',
            'fadewhite',
            'radial',
            'smoothleft',
            'smoothright',
            'smoothup',
            'smoothdown',
            'circleopen',
            'circleclose',
            'vertopen',
            'vertclose',
            'horzopen',
            'horzclose',
            'dissolve',
            'pixelize',
            'diagtl',
            'diagtr',
            'diagbl',
            'diagbr',
            'hlslice',
            'hrslice',
            'vuslice',
            'vdslice'
        ]
    },
        {
            "name": "file",
            "required": false,
            "specifarg": false,
            "orig": "{file}"
        },
        {
            "name": "file2",
            "required": false,
            "specifarg": false,
            "orig": "{file2}"
        },
        {
            "name": "duration",
            "required": false,
            "specifarg": true,
            "orig": "[-duration <seconds (max 10)>]"
        },
        {
            "name": "waituntilend",
            "required": false,
            "specifarg": true,
            "orig": "[-waituntilend]"
        }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, getUrls, validateFile, downloadFile, fetchPingPerms,
            execPromise, findpreset, sendFile
        } = poopy.functions
        let vars = poopy.vars

        await msg.channel.sendTyping().catch(() => {})
        if (lastUrl(msg, 1) === undefined && args[2] === undefined) {
            await msg.reply('What are the files?!').catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return;
        };
        var transitions = [
            'fade',
            'wipeleft',
            'wiperight',
            'wipeup',
            'wipedown',
            'slideleft',
            'slideright',
            'slideup',
            'slidedown',
            'circlecrop',
            'rectcrop',
            'distance',
            'fadeblack',
            'fadewhite',
            'radial',
            'smoothleft',
            'smoothright',
            'smoothup',
            'smoothdown',
            'circleopen',
            'circleclose',
            'vertopen',
            'vertclose',
            'horzopen',
            'horzclose',
            'dissolve',
            'pixelize',
            'diagtl',
            'diagtr',
            'diagbl',
            'diagbr',
            'hlslice',
            'hrslice',
            'vuslice',
            'vdslice'
        ]
        var unsupported = [
            'hblur',
            'fadegrays',
            'wipetl',
            'wipetr',
            'wipebl',
            'wipebr',
            'squeezev',
            'squeezeh',
            'custom'
        ]
        var duration = 1
        var durationindex = args.indexOf('-duration')
        if (durationindex > -1) {
            duration = isNaN(Number(args[durationindex + 1])) ? 1: Number(args[durationindex + 1]) <= 0 ? 0: Number(args[durationindex + 1]) >= 10 ? 10: Number(args[durationindex + 1]) ?? 1
        }
        var currenturl = lastUrl(msg, 0) || args[1]
        var currenturl2 = lastUrl(msg, 1) || args[2]
        var urls = await getUrls(msg).catch(() => {}) ?? []
        if (urls.length < 2) {
            var c = currenturl
            currenturl = currenturl2
            currenturl2 = c
        }
        var transition = 'fade'
        var targs = args.slice(1, 3)
        for (var i in targs) {
            var arg = targs[i]

            if (unsupported.find(t => t === arg.toLowerCase())) {
                await msg.reply('Sorry, but that transition isn\'t supported...').catch(() => {})
                await msg.channel.sendTyping().catch(() => {})
                return
            }
            if (arg.toLowerCase() === 'random') {
                transition = transitions[Math.floor(Math.random() * transitions.length)]
                break
            } else if (transitions.find(t => t === arg.toLowerCase())) {
                transition = arg.toLowerCase()
                break
            }
        }
        var errors = {}
        var fileinfo = await validateFile(currenturl, false, {
            size: `the first file exceeds the size limit of {param} mb hahahaha (try to use the shrink, setfps, trim or crunch commands)`,
            frames: `the frames of the first file exceed the limit of {param} hahahaha (try to use the setfps or the trim commands)`,
            width: `the width of the first file exceeds the limit of {param} hahahaha (try to use the shrink command)`,
            height: `the height of the first file exceeds the limit of {param} hahahaha (try to use the shrink command)`
        }).catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return;
        })
        if (!fileinfo) return
        var filetype = fileinfo.type
        var fileinfo2 = await validateFile(currenturl2, false, {
            size: `the second file exceeds the size limit of {param} mb hahahaha (try to use the shrink, setfps, trim or crunch commands)`,
            frames: `the frames of the second file exceed the limit of {param} hahahaha (try to use the setfps or the trim commands)`,
            width: `the width of the second file exceeds the limit of {param} hahahaha (try to use the shrink command)`,
            height: `the height of the second file exceeds the limit of {param} hahahaha (try to use the shrink command)`
        }).catch(async error => {
            await msg.reply({
                content: error,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return;
        })
        if (!fileinfo2) return
        var filetype2 = fileinfo2.type
        var filetypes = [filetype,
            filetype2]
        for (var i in errors) {
            var error = errors[i]
            if (error) {
                await msg.reply({
                    content: error,
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => {})
                await msg.channel.sendTyping().catch(() => {})
                return
            }
        }
        for (var i in filetypes) {
            var type = filetypes[i]
            if (!(type.mime.startsWith('image') || type.mime.startsWith('video'))) {
                await msg.reply({
                    content: 'Unsupported file types.',
                    allowedMentions: {
                        parse: fetchPingPerms(msg)
                    }
                }).catch(() => {})
                await msg.channel.sendTyping().catch(() => {})
                return
            }
        }
        var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
            fileinfo        })
        var filename = `input.${fileinfo.shortext}`
        await downloadFile(currenturl2, `input2.${fileinfo2.shortext}`, {
            fileinfo: fileinfo2,
            filepath: filepath
        })
        var filename2 = `input2.${fileinfo2.shortext}`

        var width = fileinfo.info.width
        var height = fileinfo.info.height

        if (duration > 0) {
            if ((filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) && (filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext)))) {
                await execPromise(`ffmpeg -stream_loop -1 -t ${duration} -i ${filepath}/${filename} -stream_loop -1 -t ${duration} -i ${filepath}/${filename2} -stream_loop -1 -t ${duration} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto[transition];[0:v][transition]xfade=transition=${transition}:duration=${duration},scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -loop 0 -t ${duration} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            } else if ((filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) && ((filetype2.mime.startsWith('image') && vars.gifFormats.find(f => f === filetype2.ext)))) {
                var fps2 = fileinfo2.info.fps
                var iduration2 = Number(fileinfo2.info.duration.includes('N/A') ? '0': fileinfo2.info.duration)

                await execPromise(`ffmpeg -stream_loop -1 -t ${iduration2} -r ${fps2.includes('0/0') ? '60': fps2} -i ${filepath}/${filename} -stream_loop -1 -t ${iduration2 + (args.find(arg => arg === '-waituntilend') ? duration: 0)} -r ${fps2.includes('0/0') ? '60': fps2} -i ${filepath}/${filename2} -stream_loop -1 -t ${iduration2} -r ${fps2.includes('0/0') ? '60': fps2} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto[transition];[0:v][transition]xfade=transition=${transition}:duration=${duration >= iduration2 && !(filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext))) ? iduration2: duration},scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -t ${iduration2} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            } else if ((filetype.mime.startsWith('image') && vars.gifFormats.find(f => f === filetype.ext)) && (filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext)))) {
                var fps = fileinfo.info.fps

                var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0': fileinfo.info.duration)

                await execPromise(`ffmpeg -stream_loop -1 -t ${iduration + (args.find(arg => arg === '-waituntilend') ? duration: 0)} -r ${fps.includes('0/0') ? '50': fps} -i ${filepath}/${filename} -stream_loop -1 -t ${iduration} -r ${fps.includes('0/0') ? '50': fps} -i ${filepath}/${filename2} -stream_loop -1 -t ${iduration} -r ${fps.includes('0/0') ? '50': fps} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto[transition];[0:v][transition]xfade=transition=${transition}:duration=${duration}${iduration - duration > duration ? `:offset=${iduration - duration + (args.find(arg => arg === '-waituntilend') ? duration: 0)}`: ''},split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -t ${iduration} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            } else if (filetype.mime.startsWith('video') || filetype2.mime.startsWith('video')) {
                var audio = fileinfo.info.audio
                var audio2 = fileinfo2.info.audio
                var fps = filetype.mime.startsWith('video') ? fileinfo.info.fps: fileinfo2.info.fps

                var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0': fileinfo.info.duration)
                var iduration2 = Number(fileinfo2.info.duration.includes('N/A') ? '0': fileinfo2.info.duration)

                await execPromise(`ffmpeg -i ${filepath}/${filename} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -video_track_timescale 30k -pix_fmt yuv420p -c:a aac -ac 6 -ar 44100 ${filepath}/concat.mp4`)
                await execPromise(`ffmpeg -i ${filepath}/${filename2} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -video_track_timescale 30k -pix_fmt yuv420p -c:a aac -ac 6 -ar 44100 ${filepath}/concat2.mp4`)
                await execPromise(`ffmpeg -stream_loop -1 -t ${audio ? iduration + (args.find(arg => arg === '-waituntilend') && (filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) ? duration: 0): iduration + iduration2 + (args.find(arg => arg === '-waituntilend') && (filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) ? duration: 0)} -r ${fps.includes('0/0') ? '60': fps} -i ${filepath}/concat.mp4 -stream_loop -1 -t ${iduration2} -i ${filepath}/concat2.mp4 -stream_loop -1 -t ${iduration2} -r ${fps.includes('0/0') ? '50': fps} -i assets/image/transparent.png ${!audio && audio2 ? `-stream_loop -1 -t ${iduration2} -r ${fps.includes('0/0') ? '50': fps} -itsoffset ${iduration} -i ${filepath}/concat2.mp4 `: ''}-filter_complex "[1:v]scale=-1:${height},scale=ceil(iw/2)*2:ceil(ih/2)*2[vid];[2:v]scale=${width}:${height},scale=ceil(iw/2)*2:ceil(ih/2)*2[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,fps=${fps.includes('0/0') ? '50': fps}[transition];[0:v][transition]xfade=transition=${transition}:duration=${duration >= iduration2 && !(filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext))) ? iduration2: duration}${iduration - duration > duration ? `:offset=${iduration - duration + (args.find(arg => arg === '-waituntilend') && (filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) ? duration: 0)}`: ''},scale=ceil(iw/2)*2:ceil(ih/2)*2[out]${audio && audio2 ? `;[0:a][1:a]acrossfade=d=${duration}[aout]`: ''}" -map "[out]" ${(audio && audio2) ? '-map "[aout]" ': (audio && !audio2) ? '-map 0:a ': (!audio && audio2) ? '-map 3:a ': ''}-aspect ${width}:${height} -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p -t ${iduration + iduration2} ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            } else {
                var fps = fileinfo.info.fps

                var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0': fileinfo.info.duration)
                var iduration2 = Number(fileinfo2.info.duration.includes('N/A') ? '0': fileinfo2.info.duration)

                await execPromise(`ffmpeg -stream_loop -1 -t ${iduration + (args.find(arg => arg === '-waituntilend') ? duration: 0)} -r ${fps.includes('0/0') ? '50': fps} -i ${filepath}/${filename} -stream_loop -1 -t ${iduration2} -i ${filepath}/${filename2} -stream_loop -1 -t ${iduration2} -r ${fps.includes('0/0') ? '50': fps} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,fps=${fps.includes('0/0') ? '50': fps}[transition];[0:v][transition]xfade=transition=${transition}:duration=${duration >= iduration2 && !(filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext))) ? iduration2: duration}${iduration - duration > duration ? `:offset=${iduration - duration + (args.find(arg => arg === '-waituntilend') ? duration: 0)}`: ''},split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -t ${iduration + iduration2} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            }
        } else {
            if ((filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) && (filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext)))) {
                await execPromise(`ffmpeg -i ${filepath}/${filename} -i ${filepath}/${filename2} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,setsar=sar=1,setdar=dar=1[transition2];[0:v]setsar=sar=1,setdar=dar=1[transition];[transition][transition2]concat,scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -aspect ${width}:${height} -map "[out]" -preset ${findpreset(args)} -loop 0 ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            } else if ((filetype.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype.ext))) && ((filetype2.mime.startsWith('image') && vars.gifFormats.find(f => f === filetype2.ext)))) {
                var fps2 = fileinfo2.info.fps

                await execPromise(`ffmpeg -r ${fps2.includes('0/0') ? '60': fps2} -i ${filepath}/${filename} -r ${fps2.includes('0/0') ? '60': fps2} -i ${filepath}/${filename2} -r ${fps2.includes('0/0') ? '60': fps2} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,setsar=sar=1,setdar=dar=1[transition2];[0:v]setsar=sar=1,setdar=dar=1[transition];[transition][transition2]concat,scale='min(400,iw)':min'(400,ih)':force_original_aspect_ratio=decrease,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -aspect ${width}:${height} -map "[out]" -preset ${findpreset(args)} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            } else if ((filetype.mime.startsWith('image') && vars.gifFormats.find(f => f === filetype.ext)) && (filetype2.mime.startsWith('image') && !(vars.gifFormats.find(f => f === filetype2.ext)))) {
                var fps = fileinfo.info.fps

                await execPromise(`ffmpeg -r ${fps.includes('0/0') ? '50': fps} -i ${filepath}/${filename} -r ${fps.includes('0/0') ? '50': fps} -i ${filepath}/${filename2} -r ${fps.includes('0/0') ? '50': fps} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,setsar=sar=1,setdar=dar=1[transition2];[0:v]setsar=sar=1,setdar=dar=1[transition];[transition][transition2]concat,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -aspect ${width}:${height} -map "[out]" -preset ${findpreset(args)} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            } else if (filetype.mime.startsWith('video') || filetype2.mime.startsWith('video')) {
                var audio = fileinfo.info.audio
                var audio2 = fileinfo2.info.audio
                var fps = filetype.mime.startsWith('video') ? fileinfo.info.fps: fileinfo2.info.fps

                var iduration = Number(fileinfo.info.duration.includes('N/A') ? '0': fileinfo.info.duration)

                await execPromise(`ffmpeg -i ${filepath}/${filename} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -video_track_timescale 30k -pix_fmt yuv420p -c:a aac -ac 6 -ar 44100 ${filepath}/concat.mp4`)
                await execPromise(`ffmpeg -i ${filepath}/${filename2} -vf "scale=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -video_track_timescale 30k -pix_fmt yuv420p -c:a aac -ac 6 -ar 44100 ${filepath}/concat2.mp4`)
                await execPromise(`ffmpeg -r ${fps.includes('0/0') ? '60': fps} -i ${filepath}/concat.mp4 -i ${filepath}/concat2.mp4 -r ${fps.includes('0/0') ? '50': fps} -i assets/image/transparent.png ${!audio && audio2 ? `-r ${fps.includes('0/0') ? '50': fps} -itsoffset ${iduration} -i ${filepath}/concat2.mp4 `: ''}-filter_complex "[1:v]scale=-1:${height},scale=ceil(iw/2)*2:ceil(ih/2)*2[vid];[2:v]scale=${width}:${height},scale=ceil(iw/2)*2:ceil(ih/2)*2[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,setsar=sar=1,setdar=dar=1,fps=${fps.includes('0/0') ? '50': fps}[transition2];[0:v]setsar=sar=1,setdar=dar=1[transition];[transition][transition2]concat=v=1:a=0,scale=ceil(iw/2)*2:ceil(ih/2)*2[out]${audio && audio2 ? `;[0:a][1:a]concat=v=0:a=1[aout]`: ''}" -map "[out]" ${(audio && audio2) ? '-map "[aout]" ': (audio && !audio2) ? '-map 0:a ': (!audio && audio2) ? '-map 3:a ': ''}-aspect ${width}:${height} -preset ${findpreset(args)} -c:v libx264 -pix_fmt yuv420p ${filepath}/output.mp4`)
                return await sendFile(msg, filepath, `output.mp4`)
            } else {
                var fps = fileinfo.info.fps

                await execPromise(`ffmpeg -r ${fps.includes('0/0') ? '50': fps} -i ${filepath}/${filename} -i ${filepath}/${filename2} -r ${fps.includes('0/0') ? '50': fps} -i assets/image/transparent.png -filter_complex "[1:v]scale=-1:${height}[vid];[2:v]scale=${width}:${height}[transparent];[transparent][vid]overlay=x=W/2-w/2:y=H/2-h/2:format=auto,setsar=sar=1,setdar=dar=1,fps=${fps.includes('0/0') ? '50': fps}[transition2];[0:v]setsar=sar=1,setdar=dar=1[transition];[transition][transition2]concat,split[gnout][gpout];[gpout]palettegen=reserve_transparent=1[palette];[gnout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -aspect ${width}:${height} -preset ${findpreset(args)} ${filepath}/output.gif`)
                return await sendFile(msg, filepath, `output.gif`)
            }
        }
    },
    help: {
        name: 'transition {transition (default is fade)} {file} {file2} [-duration <seconds (max 10)>] [-waituntilend]',
        value: 'Does a transition between the first file and the second one, 0 duration means no transition. A list of transitions can be found here, including random: https://trac.ffmpeg.org/wiki/Xfade'
    },
    cooldown: 2500,
    type: 'Animation'
}