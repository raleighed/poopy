#!/bin/node worker.js

let throng = require('throng')
let os = require('os')
let fs = require('fs-extra')
let { exec, spawn } = require('child_process')

var url = process.env.CLOUDAMQP_URL || "amqp://localhost";
let memLimit = 0;
let msgSizeLimit = 1024 * 1024 * 8 - 3;
let procs = [];
let workers = 1;
let datastores = {};
let globaldata;

if (!fs.existsSync('temp')) fs.mkdirSync('temp')

function regexClean(str) {
    return str.replace(/[\\^$.|?*+()[{]/g, (match) => `\\${match}`)
}

function digitRegex(filename) {
    filename = regexClean(filename)

    var digregName = filename.replace(/%(0\d)?d/g, (dmatch) => {
        dmatch = dmatch.substring(1)
        if (dmatch.substring(0, dmatch.length - 1)) return `\\d{${dmatch.substring(1, dmatch.length - 1)}}`
        else return `\\d`
    })

    return new RegExp(digregName)
}

function mkdirs(filepath) {
    var folders = filepath.split('/')
    var levels = []

    folders.forEach(folder => {
        var dir = levels.length > 0 ?
            `${levels.join('/')}/${folder}` :
            folder

        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        levels.push(folder)
    })
}

function dir_name(filedir) {
    var dirsplit = filedir.split('/')
    var name = dirsplit.splice(dirsplit.length - 1, 1)[0]
    var dir = dirsplit.join('/')

    return [dir, name]
}

function tryJSONparse(obj) {
    try {
        return JSON.parse(obj)
    } catch (_) {
        return null
    }
}

let processingTools = require('./src/processingTools')

function execPromise(code) {
    return new Promise((resolve) => {
        var exargs = code.split(' ')
        exargs[0] = processingTools.names[exargs[0]] ?? exargs[0]
        code = exargs.join(' ')

        var args = code.match(/("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/g)
        var command = args.splice(0, 1)[0]

        var stdout = []
        var stderr = []
        var stdoutclosed = false
        var stderrclosed = false
        var procExited = false

        var proc = spawn(command, args, {
            shell: true,
            env: {
                ...process.env
            }
        })

        var memoryInterval = setInterval(() => {
            var usage = process.memoryUsage()
            var rss = usage.rss
            if ((rss / 1024 / 1024) <= memLimit) {
                if (os.platform() == 'win32') exec(`taskkill /pid ${proc.pid} /f /t`)
                else exec(`kill -9 ${proc.pid}`) //proc.kill('SIGKILL')
            }
        }, 1000)

        function handleExit() {
            if (!stdoutclosed || !stderrclosed || !procExited) return
            var fproc = procs.findIndex(p => p === proc)
            if (fproc > -1) procs.splice(fproc, 1)
            var out = stdout.join('\n') || stderr.join('\n')
            clearInterval(memoryInterval)
            proc.removeAllListeners()
            resolve(out)
        }

        proc.stdout.on('data', (buffer) => {
            if (!buffer.toString()) return
            stdout.push(buffer.toString())
        })

        proc.stderr.on('data', (buffer) => {
            if (!buffer.toString()) return
            stderr.push(buffer.toString())
        })

        proc.stdout.on('close', () => {
            stdoutclosed = true
            handleExit()
        })

        proc.stderr.on('close', () => {
            stderrclosed = true
            handleExit()
        })

        proc.on('error', (err) => {
            clearInterval(memoryInterval)
            proc.removeAllListeners()
            resolve(err.message)
        })

        proc.on('exit', () => {
            procExited = true
            handleExit()
        })

        procs.push(proc)
    })
}

async function processJob(data) {
    let execJob = async () => {
        let code = data.code
        if (!code) throw { err: 'No code was provided!' }

        let args = code.split(' ')
        let command = args[0]

        let delfolders = []

        for (let inpdir in (data.files ?? {})) {
            let [idir] = dir_name(inpdir)

            mkdirs(idir)

            fs.writeFileSync(inpdir, Buffer.from(data.files[inpdir], 'base64'))

            if (!delfolders.includes(idir.split('/').slice(0, 3).join('/'))) delfolders.push(idir.split('/').slice(0, 3).join('/'))
        }

        let filedir = processingTools.outputs[command] &&
            processingTools.outputs[command](args)
        let dir, name
        let nameregex

        if (filedir) {
            [dir, name] = dir_name(filedir)
            if (command == 'gmic' && args.includes('morph')) {
                var namesplit = name.split('.')
                name = `${namesplit.slice(0, namesplit.length - 1).join('.')}_%06d.${namesplit[namesplit.length - 1]}`
            }

            nameregex = digitRegex(name)

            mkdirs(dir)

            if (!delfolders.includes(dir.split('/').slice(0, 3).join('/'))) delfolders.push(dir.split('/').slice(0, 3).join('/'))
        }

        const execProc = await execPromise(code)

        let output = {
            std: execProc
        }

        if (dir && nameregex) {
            output.files = {}

            fs.readdirSync(dir).forEach(file => {
                if (file.match(nameregex)) output.files[file] = fs.readFileSync(`${dir}/${file}`).toString('base64')
            })
        }

        if (delfolders.length) delfolders.forEach(delfolder => fs.rmSync(delfolder, { force: true, recursive: true }))

        return output
    }

    switch (data.type) {
        case 'exec':
            return await execJob();

        case 'eval':
            try {
                return { value: eval(data.code) }
            } catch (err) {
                throw { err: err.stack }
            };
    }
}

function tryJSONparse(obj) {
    try {
        return JSON.parse(obj)
    } catch (_) {
        return null
    }
}

let chunkdata = {}

function updateEnvironment() {
    if (!fs.existsSync('.env')) return

    const env = fs.readFileSync('.env').toString()

    for (const line of env.split('\n')) {
        if (!line || !line.includes("=") || line.startsWith("#")) continue

        let [key, value] = line.split("=", 2)
        if (!key || !value || process.env[key]) continue

        process.env[key] = value
    }
}

async function start(id) {
    console.log(`worker ${id} started`)

    var conn = await require('amqplib').connect(url)
    var ch = await conn.createChannel()
    await ch.assertExchange('crash', 'fanout', {
        durable: false
    })

    ch.publish('crash', '', Buffer.from('The worker has crashed'))
    ch.ackAll()

    await ch.assertQueue('tasks', { durable: true })
    await ch.prefetch(1)

    await ch.consume('tasks', async function (msg) {
        var content = msg.content.toString()
        if (!chunkdata[msg.properties.correlationId]) chunkdata[msg.properties.correlationId] = []

        var order = Number(content.substring(0, 3))
        var chunk = content.substring(3)
        chunkdata[msg.properties.correlationId].push({ order, chunk })
        chunkdata[msg.properties.correlationId].sort((a, b) => a.order - b.order)

        var chunkjoin = chunkdata[msg.properties.correlationId].map(c => c.chunk).join('')
        var data = tryJSONparse(chunkjoin)
        if (data) {
            delete chunkdata[msg.properties.correlationId]

            var res = data ? (await processJob(data).catch(() => { }) ?? {}) : {}
    
            var resdata = Buffer.from(JSON.stringify(res))
            var reschunks = []
    
            for (var i = 0; i < Math.ceil(resdata.length / msgSizeLimit); i++) {
                var chunk = resdata.subarray(msgSizeLimit * i, msgSizeLimit * (i + 1))
                var ordchunk = Buffer.concat([Buffer.from(String(i).padStart(3, '0')), chunk])
                reschunks.push(ordchunk)
            }
    
            for (var chunk of reschunks) {
                ch.sendToQueue(msg.properties.replyTo, chunk, {
                    correlationId: msg.properties.correlationId
                })
            }
        }
    }, { noAck: true })
}

updateEnvironment()
throng({ workers, start })
