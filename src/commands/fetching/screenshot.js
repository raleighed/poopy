module.exports = {
    name: ['screenshot', 'savesite'],
    args: [{ "name": "site", "required": true, "specifarg": false, "orig": "<site>" }],
    execute: async function (msg, args) {
        let poopy = this;
        let vars = poopy.vars;
        let { sendFile } = poopy.functions
        let { fs, puppeteer } = poopy.modules;

        if (!puppeteer) {
            await msg.reply("This function isn't available at the moment.").catch(() => { })
            return "This function isn't available at the moment."
        }

        const site = args.slice(1).join(' ').trim();

        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 0.7
        })

        await msg.channel.sendTyping().catch(() => { })

        let blacklisted = ['porn', 'xvideos', 'gay', 'xxx', 'e621', 'rule34'];
        let ipBlacklisted = ['ipify', 'iplogger']

        if (
            ipBlacklisted.find(element => site.toLowerCase().includes(element)) ||
            (blacklisted.find(element => site.toLowerCase().includes(element)) && !msg.channel.nsfw)
        ) {
            msg.reply("the body will not be found").catch(() => { });
            return;
        }

        let success = true;
        await page.goto(site).catch(async (Error) => {
            await msg.reply("Invalid URL (or other error)!").catch(() => { });
            console.error(Error);
            success = false;
        })

        if (!success) { return };
        
        var currentcount = vars.filecount
        vars.filecount++
        fs.mkdirSync(`temp/${config.database}/file${currentcount}`)
        filepath = `temp/${config.database}/file${currentcount}`

        await page.screenshot({ path: `${filepath}/output.png` })

        await browser.close()

        return await sendFile(msg, filepath, 'output.png');
    },
    help: {
        name: 'screenshot/savesite <site>',
        value: 'Takes a screenshot of a website.'
    },
    cooldown: 3000,
    type: 'Fetching'
}