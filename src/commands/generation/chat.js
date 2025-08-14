const defaultInstruct = `You are a simple chat assistant.\n` +
    `- Your answers must be clear, direct, and concise.\n` +
    `- Each answer MUST be under 2000 characters.\n` +
    `- Use plain language and avoid unnecessary details.\n` +
    `- If multiple interpretations exist, address the most likely one briefly.\n` +
    `- Only ask clarifying questions if absolutely necessary.\n` +
    `- When using hyperlinks in the [text](url) format, there must be no characters immediately after the closing parentheses unless it's whitespace or a newline.`;

const tools = {
    image_search: {
        data: {
            type: "function",
            function: {
                name: "image_search",
                description: "Searches the Internet for images matching the given query and returns a single relevant result.",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The image search query."
                        }
                    },
                    required: ["query"]
                }
            }
        },
        async func(poopy, msg, args) {
            const { fetchImages, randomChoice } = poopy.functions
            const { query } = args

            const response = { query }

            const images = await fetchImages(query, msg.channel.nsfw).catch(() => { })

            response.result = images ? randomChoice(images.slice(0, 5)) : null

            return response
        }
    }
}

const toolData = Object.values(tools).map(tool => tool.data)

module.exports = {
    name: ['chat', 'ask'],
    args: [
        {
            "name": "message", "required": true, "specifarg": false, "orig": "<message>"
        },
        {
            "name": "temperature", "required": false, "specifarg": true, "orig": "[-temperature <number (from 0 to 1)>]"
        },
        {
            "name": "instruct", "required": false, "specifarg": true, "orig": "[-instruct <prompt>]"
        },
        {
            "name": "clear", "required": false, "specifarg": true, "orig": "[-clear]"
        }
    ],
    execute: async function (msg, args) {
        let poopy = this
        let { tempdata } = poopy
        let { getOption, parseNumber, userToken, fetchPingPerms } = poopy.functions
        let { axios, fs, Discord } = poopy.modules
        let vars = poopy.vars
        let config = poopy.config

        await msg.channel.sendTyping().catch(() => { })

        var temperature = getOption(args, 'temperature', { dft: 1, splice: true, n: 1, join: true, func: (opt) => parseNumber(opt, { dft: 0.4, min: 0, max: 1, round: false }) })
        var instruct = getOption(args, 'instruct', { dft: defaultInstruct, splice: true, n: Infinity, join: true, stopMatch: ["-clear", "-temperature"] })
        var clear = getOption(args, 'clear', { n: 0, splice: true, dft: false })

        var saidMessage = args.slice(1).join(' ')
        if (args[1] === undefined) {
            await msg.reply('What is the text to generate?!').catch(() => { })
            await msg.channel.sendTyping().catch(() => { })
            return
        }

        if (!tempdata[msg.channel.id]) tempdata[msg.channel.id] = {}
        if (!tempdata[msg.channel.id][msg.author.id]) tempdata[msg.channel.id][msg.author.id] = {}

        var contexts = tempdata[msg.channel.id][msg.author.id].chatcontexts
        if (!contexts) contexts = tempdata[msg.channel.id][msg.author.id].chatcontexts = {}

        var ourContext = contexts[instruct]
        if (!ourContext || (Date.now() - ourContext.lastMessage) > 1000 * 60 * 10 || clear) ourContext = contexts[instruct] = {
            history: [
                {
                    role: "system",
                    content: instruct
                }
            ]
        }

        ourContext.lastMessage = Date.now()

        var ourHistory = ourContext.history

        ourHistory.push({
            role: "user",
            content: saidMessage
        })

        var resp, data, message

        async function makeChatRequest() {
            resp = await axios({
                url: `https://api.ai21.com/studio/v1/chat/completions`,
                method: 'POST',
                data: {
                    model: "jamba-large-1.7",
                    messages: ourHistory,
                    tools: toolData,
                    temperature: temperature,
                    top_p: 1
                },
                headers: {
                    Authorization: `Bearer ${userToken(msg.author.id, 'AI21_KEY')}`
                }
            }).catch((e) => console.log(e))

            if (!resp) {
                await msg.reply('Error.').catch(() => { })
                return
            }

            data = resp.data.choices[0]
            message = data.message

            ourHistory.push(message)
        }

        await makeChatRequest()
        if (!message) return

        if (message.tool_calls) {
            for (const toolCall of message.tool_calls) {
                const functionName = toolCall.function.name
                const functionArgs = JSON.parse(toolCall.function.arguments)

                const toolFunction = tools[functionName].func
                const functionResult = await toolFunction(poopy, msg, functionArgs)

                ourHistory.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(functionResult)
                })
            }

            await makeChatRequest()
            if (!message) return
        }

        var tokenAmount = resp.data.usage.total_tokens

        if (tokenAmount > 200000) ourHistory.slice(1, 1) // what was this for? limits??

        if (!msg.nosend) await msg.reply({
            content: message.content,
            allowedMentions: {
                parse: fetchPingPerms(msg)
            }
        }).catch(async () => {
            var currentcount = vars.filecount
            vars.filecount++
            var filepath = `temp/${config.database}/file${currentcount}`
            fs.mkdirSync(`${filepath}`)
            fs.writeFileSync(`${filepath}/generated.txt`, message.content)
            await msg.reply({
                files: [new Discord.AttachmentBuilder(`${filepath}/generated.txt`)]
            }).catch(() => { })
            fs.rmSync(`${filepath}`, { force: true, recursive: true })
        })
        return resp.data.choices[0].message.content
    },
    help: {
        name: 'chat/ask <message> [-temperature <number (from 0 to 1)>] [-instruct <prompt>] [-clear]',
        value: 'Generates an answer based on your prompt using AI21. Default temperature is 0.4.'
    },
    type: 'Generation',
    envRequired: ['AI21_KEY']
}
