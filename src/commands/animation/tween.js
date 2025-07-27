module.exports = {
    name: ['tween'],
    args: [{
        "name": "file",
        "required": false,
        "specifarg": false,
        "orig": "{file}"
    },
        {
            "name": "width",
            "required": false,
            "specifarg": true,
            "orig": "[-width <pixels>]"
        },
        {
            "name": "height",
            "required": false,
            "specifarg": true,
            "orig": "[-height <pixels>]"
        },
        {
            "name": "duration",
            "required": false,
            "specifarg": true,
            "orig": "[-duration <seconds (max 10)>]"
        },
        {
            "name": "startsize",
            "required": false,
            "specifarg": true,
            "orig": "[-(start/end)size <x> <y>]"
        },
        {
            "name": "endsize",
            "required": false,
            "specifarg": true,
            "orig": "[-(start/end)size <x> <y>]"
        },
        {
            "name": "origin",
            "required": false,
            "specifarg": true,
            "orig": "[-origin <x (left/center/right)> <y (top/middle/bottom)>]",
            "autocomplete": [
                'left top',
                'center top',
                'right top',
                'left middle',
                'center middle',
                'right middle',
                'left bottom',
                'center bottom',
                'right bottom',
            ]
        },
        {
            "name": "startoffset",
            "required": false,
            "specifarg": true,
            "orig": "[-(start/end)offset <x> <y>]"
        },
        {
            "name": "endoffset",
            "required": false,
            "specifarg": true,
            "orig": "[-(start/end)offset <x> <y>]"
        },
        {
            "name": "startangle",
            "required": false,
            "specifarg": true,
            "orig": "[-(start/end)angle <degrees>]"
        },
        {
            "name": "endangle",
            "required": false,
            "specifarg": true,
            "orig": "[-(start/end)angle <degrees>]"
        },
        {
            "name": "fitangle",
            "required": false,
            "specifarg": true,
            "orig": "[-fitangle]"
        },
        {
            "name": "easing",
            "required": false,
            "specifarg": true,
            "orig": "[-easing <style>]",
            "autocomplete": [
                'linear',
                'easeinsine',
                'easeoutsine',
                'easeinoutsine',
                'easeinquad',
                'easeoutquad',
                'easeinoutquad',
                'easeincubic',
                'easeoutcubic',
                'easeinoutcubic',
                'easeinquart',
                'easeoutquart',
                'easeinoutquart',
                'easeinquint',
                'easeoutquint',
                'easeinoutquint',
                'easeinexpo',
                'easeoutexpo',
                'easeinoutexpo',
                'easeincirc',
                'easeoutcirc',
                'easeinoutcirc',
                'easeinback',
                'easeoutback',
                'easeinoutback',
                'easeinelastic',
                'easeoutelastic',
                'easeinoutelastic',
                'easeinbounce',
                'easeoutbounce',
                'easeinoutbounce'
            ]
        }],
    execute: async function (msg, args) {
        let poopy = this
        let {
            lastUrl, validateFile, downloadFile, execPromise,
            findpreset, sendFile, fetchPingPerms
        } = poopy.functions
        let { DiscordTypes } = poopy.modules

        await msg.channel.sendTyping().catch(() => {})
        if (lastUrl(msg, 0) === undefined && args[1] === undefined) {
            await msg.reply('What is the file?!').catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return;
        };
        var duration = 1
        var durationindex = args.indexOf('-duration')
        if (durationindex > -1) {
            duration = isNaN(Number(args[durationindex + 1])) ? 1: Number(args[durationindex + 1]) <= 0.05 ? 0.05: Number(args[durationindex + 1]) >= 10 ? 10: Number(args[durationindex + 1]) || 1
        }
        var width = 300
        var widthindex = args.indexOf('-width')
        if (widthindex > -1) {
            width = isNaN(Number(args[widthindex + 1])) ? 300: Number(args[widthindex + 1]) <= 1 ? 1: Number(args[widthindex + 1]) >= 1000 ? 1000: Number(args[widthindex + 1]) || 300
        }
        var height = 300
        var heightindex = args.indexOf('-height')
        if (heightindex > -1) {
            height = isNaN(Number(args[heightindex + 1])) ? 300: Number(args[heightindex + 1]) <= 1 ? 1: Number(args[heightindex + 1]) >= 1000 ? 1000: Number(args[heightindex + 1]) || 300
        }
        var startsize = [100,
            100]
        var startsizeindex = args.indexOf('-startsize')
        if (startsizeindex > -1) {
            startsize[0] = isNaN(Number(args[startsizeindex + 1])) ? 100: Number(args[startsizeindex + 1]) <= 1 ? 1: Number(args[startsizeindex + 1]) >= 3000 ? 3000: Number(args[startsizeindex + 1]) || 100
            startsize[1] = isNaN(Number(args[startsizeindex + 2])) ? 100: Number(args[startsizeindex + 2]) <= 1 ? 1: Number(args[startsizeindex + 1]) >= 3000 ? 3000: Number(args[startsizeindex + 2]) || 100
        }
        var endsize = [startsize[0],
            startsize[1]]
        var endsizeindex = args.indexOf('-endsize')
        if (endsizeindex > -1) {
            endsize[0] = isNaN(Number(args[endsizeindex + 1])) ? endsize[0]: Number(args[endsizeindex + 2]) <= 1 ? 1: Number(args[endsizeindex + 1]) >= 3000 ? 3000: Number(args[endsizeindex + 1]) || endsize[0]
            endsize[1] = isNaN(Number(args[endsizeindex + 2])) ? endsize[1]: Number(args[endsizeindex + 2]) <= 1 ? 1: Number(args[endsizeindex + 1]) >= 3000 ? 3000: Number(args[endsizeindex + 2]) || endsize[1]
        }
        var easings = {
            linear: `'lerp({start},{end},(t/${duration}))'`,
            easeinsine: `'lerp({start},{end},1-cos((t/${duration})*PI/2))'`,
            easeoutsine: `'lerp({start},{end},sin(((t/${duration})*PI)/2))'`,
            easeinoutsine: `'lerp({start},{end},-(cos(PI*(t/${duration}))-1)/2)'`,
            easeinquad: `'lerp({start},{end},(t/${duration})*(t/${duration}))'`,
            easeoutquad: `'lerp({start},{end},1-(1-(t/${duration}))*(1-(t/${duration})))'`,
            easeinoutquad: `'lerp({start},{end},if(lt((t/${duration}),0.5),2*(t/${duration})*(t/${duration}),1-pow(-2*(t/${duration})+2,2)/2))'`,
            easeincubic: `'lerp({start},{end},(t/${duration})*(t/${duration})*(t/${duration}))'`,
            easeoutcubic: `'lerp({start},{end},1-pow(1-(t/${duration}),3))'`,
            easeinoutcubic: `'lerp({start},{end},if(lt((t/${duration}),0.5),4*(t/${duration})*(t/${duration})*(t/${duration}),1-pow(-2*(t/${duration})+2,3)/2))'`,
            easeinquart: `'lerp({start},{end},(t/${duration})*(t/${duration})*(t/${duration})*(t/${duration}))'`,
            easeoutquart: `'lerp({start},{end},1-pow(1-(t/${duration}),4))'`,
            easeinoutquart: `'lerp({start},{end},if(lt((t/${duration}),0.5),8*(t/${duration})*(t/${duration})*(t/${duration})*(t/${duration}),1-pow(-2*(t/${duration})+2,4)/2))'`,
            easeinquint: `'lerp({start},{end},(t/${duration})*(t/${duration})*(t/${duration})*(t/${duration})*(t/${duration}))'`,
            easeoutquint: `'lerp({start},{end},1-pow(1-(t/${duration}),5))'`,
            easeinoutquint: `'lerp({start},{end},if(lt((t/${duration}),0.5),16*(t/${duration})*(t/${duration})*(t/${duration})*(t/${duration})*(t/${duration}),1-pow(-2*(t/${duration})+2,5)/2))'`,
            easeinexpo: `'lerp({start},{end},if(eq((t/${duration}),0),0,pow(2,10*(t/${duration})-10)))'`,
            easeoutexpo: `'lerp({start},{end},if(eq((t/${duration}),1),1,1-pow(2,-10*(t/${duration}))))'`,
            easeinoutexpo: `'lerp({start},{end},if(eq((t/${duration}),0),0,if(eq((t/${duration}),1),1,if(lt((t/${duration}),0.5,pow(2,20*(t/${duration})-10)/2,(2-pow(2,-20*(t/${duration})+10))/2)))))'`,
            easeincirc: `'lerp({start},{end},1-sqrt(1-pow((t/${duration}),2)))'`,
            easeoutcirc: `'lerp({start},{end},sqrt(1-pow((t/${duration})-1,2)))'`,
            easeinoutcirc: `'lerp({start},{end},if(lt((t/${duration}),0.5),(1-sqrt(1-pow(2*(t/${duration}),2)))/2,(sqrt(1-pow(-2*(t/${duration})+2,2))+1)/2))'`,
            easeinback: `'lerp({start},{end},2.70158*(t/${duration})*(t/${duration})*(t/${duration})-1.70158*(t/${duration})*(t/${duration}))'`,
            easeoutback: `'lerp({start},{end},1+2.70158*pow((t/${duration})-1,3)+1.70158*pow((t/${duration})-1,2))'`,
            easeinoutback: `'lerp({start},{end},if(lt((t/${duration}),0.5),(pow(2*(t/${duration}),2)*((2.5949095+1)*2*(t/${duration})-2.5949095))/2,(pow(2*(t/${duration})-2,2)*((2.5949095+1)*((t/${duration})*2-2)+2.5949095)+2)/2))'`,
            easeinelastic: `'lerp({start},{end},if(eq((t/${duration}),0),0,if(eq((t/${duration}),1),1,-pow(2,10*(t/${duration})-10)*sin(((t/${duration})*10-10.75)*((2*PI)/3)))))'`,
            easeoutelastic: `'lerp({start},{end},if(eq((t/${duration}),0),0,if(eq((t/${duration}),1),1,pow(2,-10*(t/${duration}))*sin(((t/${duration})*10-0.75)*((2*PI)/3))+1)))'`,
            easeinoutelastic: `'lerp({start},{end},if(eq((t/${duration}),0),0,if(eq((t/${duration}),1),1,if(lt((t/${duration}),0.5),-(pow(2,20*(t/${duration})-10)*sin((20*(t/${duration})-11.125)*((2*PI)/4.5)))/2,(pow(2,-20*(t/${duration})+10)*sin((20*(t/${duration})-11.125)*((2*PI)/4.5)))/2+1))))'`,
            easeinbounce: `'lerp({start},{end},1-(if(lt((1-(t/${duration})),1/2.75),7.5625*(1-(t/${duration}))*(1-(t/${duration})),if(lt((1-(t/${duration})),2/2.75),7.5625*((1-(t/${duration}))-1.5/2.75)*((1-(t/${duration}))-1.5/2.75)+0.75,if(lt((1-(t/${duration})),2.5/2.75),7.5625*((1-(t/${duration}))-2.25/2.75)*((1-(t/${duration}))-2.25/2.75)+0.9375,7.5625*((1-(t/${duration}))-2.625/2.75)*((1-(t/${duration}))-2.625/2.75)+0.984375)))))'`,
            easeoutbounce: `'lerp({start},{end},if(lt((t/${duration}),1/2.75),7.5625*(t/${duration})*(t/${duration}),if(lt((t/${duration}),2/2.75),7.5625*((t/${duration})-1.5/2.75)*((t/${duration})-1.5/2.75)+0.75,if(lt((t/${duration}),2.5/2.75),7.5625*((t/${duration})-2.25/2.75)*((t/${duration})-2.25/2.75)+0.9375,7.5625*((t/${duration})-2.625/2.75)*((t/${duration})-2.625/2.75)+0.984375))))'`,
            easeinoutbounce: `'lerp({start},{end},if(lt((t/${duration}),0.5),(1-if(lt((1-2*(t/${duration})),1/2.75),7.5625*(1-2*(t/${duration}))*(1-2*(t/${duration})),if(lt((1-2*(t/${duration})),2/2.75),7.5625*((1-2*(t/${duration}))-1.5/2.75)*((1-2*(t/${duration}))-1.5/2.75)+0.75,if(lt((1-2*(t/${duration})),2.5/2.75),7.5625*((1-2*(t/${duration}))-2.25/2.75)*((1-2*(t/${duration}))-2.25/2.75)+0.9375,7.5625*((1-2*(t/${duration}))-2.625/2.75)*((1-2*(t/${duration}))-2.625/2.75)+0.984375))))/2,(1+if(lt((2*(t/${duration})-1),1/2.75),7.5625*(2*(t/${duration})-1)*(2*(t/${duration})-1),if(lt((2*(t/${duration})-1),2/2.75),7.5625*((2*(t/${duration})-1)-1.5/2.75)*((2*(t/${duration})-1)-1.5/2.75)+0.75,if(lt((2*(t/${duration})-1),2.5/2.75),7.5625*((2*(t/${duration})-1)-2.25/2.75)*((2*(t/${duration})-1)-2.25/2.75)+0.9375,7.5625*((2*(t/${duration})-1)-2.625/2.75)*((2*(t/${duration})-1)-2.625/2.75)+0.984375))))/2))'`,
        }
        var easing = 'linear'
        var easingindex = args.indexOf('-easing')
        if (easingindex > -1) {
            if (easings[args[easingindex + 1].toLowerCase()]) {
                easing = args[easingindex + 1]
            } else {
                await msg.reply('Not a supported easing style.').catch(() => {})
                return
            }
        }
        var easingstring = function (start, end) {
            return easings[easing].replace('{start}', start).replace('{end}', end)
        }
        var origins = {
            x: {
                left: '0',
                center: '(W-w)/2',
                right: '(W-w)'
            },

            y: {
                top: '0',
                middle: '(H-h)/2',
                bottom: '(H-h)'
            },
        }
        var originx = '(W-w)/2'
        var originy = '(H-h)/2'
        var originindex = args.indexOf('-origin')
        if (originindex > -1) {
            originx = origins.x[args[originindex + 1]] || '(W-w)/2'
            originy = origins.y[args[originindex + 2]] || '(H-h)/2'
        }
        var startpos = [0,
            0]
        var startposindex = args.indexOf('-startoffset')
        if (startposindex > -1) {
            startpos[0] = isNaN(Number(args[startposindex + 1])) ? 0: (Number(args[startposindex + 1])) || 0
            startpos[1] = isNaN(Number(args[startposindex + 2])) ? 0: Number(args[startposindex + 2]) || 0
        }
        var endpos = [startpos[0],
            startpos[1]]
        var endposindex = args.indexOf('-endoffset')
        if (endposindex > -1) {
            endpos[0] = isNaN(Number(args[endposindex + 1])) ? startpos[0]: (Number(args[endposindex + 1]) || 0) ?? startpos[0]
            endpos[1] = isNaN(Number(args[endposindex + 2])) ? startpos[1]: (Number(args[endposindex + 2]) || 0) ?? startpos[1]
        }
        var startangle = 0
        var startangleindex = args.indexOf('-startangle')
        if (startangleindex > -1) {
            startangle = isNaN(Number(args[startangleindex + 1])) ? 0: Number(args[startangleindex + 1]) || 0
        }
        var endangle = startangle
        var endangleindex = args.indexOf('-endangle')
        if (endangleindex > -1) {
            endangle = isNaN(Number(args[endangleindex + 1])) ? startangle: (Number(args[endangleindex + 1]) || 0) ?? startangle
        }
        var currenturl = lastUrl(msg, 0) || args[1]
        var fileinfo = await validateFile(currenturl).catch(async error => {
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
        var type = fileinfo.type

        if (type.mime.startsWith('image') || type.mime.startsWith('video')) {
            var filepath = await downloadFile(currenturl, `input.${fileinfo.shortext}`, {
                fileinfo            })
            var filename = `input.${fileinfo.shortext}`
            await execPromise(`ffmpeg -stream_loop -1 -t ${duration} -i ${filepath}/${filename} -r 50 -stream_loop -1 -t ${duration} -i assets/image/transparent.png -filter_complex "[0:v]fps=50,rotate=${easingstring(startangle, endangle)}*PI/180${args.find(arg => arg === '-fitangle') ? `:ow=rotw(45*PI/180):oh=roth(45*PI/180)`: ''}:c=0x00000000,scale=${easingstring(startsize[0], endsize[0])}:${easingstring(startsize[1], endsize[1])}:eval=frame[overlay];[1:v]scale=${width}:${height}[transparent];[transparent][overlay]overlay=x=${originx}+${easingstring(startpos[0], endpos[0])}:y=${originy}+${easingstring(startpos[1], endpos[1])}:format=auto,split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -preset ${findpreset(args)} -gifflags -offsetting -r 50 -t ${duration} ${filepath}/output.gif`)
            return await sendFile(msg, filepath, `output.gif`)
        } else {
            await msg.reply({
                content: `Unsupported file: \`${currenturl}\``,
                allowedMentions: {
                    parse: fetchPingPerms(msg)
                }
            }).catch(() => {})
            await msg.channel.sendTyping().catch(() => {})
            return
        }
    },
    help: {
        name: 'tween {file} [circle options] [-(start/end)size <x> <y>] [-origin <x (left/center/right)> <y (top/middle/bottom)>] [-(start/end)offset <x> <y>] [-(start/end)angle <degrees>] [-fitangle] [-easing <style>]',
        value: 'Allows you to tween the file in a transparent background in any way possible! A least of easings can be found at https://easings.net/ (also including linear)'
    },
    cooldown: 2500,
    type: 'Animation'
}