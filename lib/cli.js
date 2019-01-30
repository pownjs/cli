const yargs = require('yargs/yargs')

const BLANK = function () {}

const execute = (args, options = {}) => {
    const { loadableModules = {}, inlineModules = {}, loadableCommands = [], inlineCommands = [] } = options

    const y = yargs(args)

    y.usage(`Usage: $0 [options] <command> [command options]`)

    y.context = {
        yargs: y,
        loadableModules: loadableModules,
        inlineModules: inlineModules,
        loadableCommands: loadableCommands,
        inlineCommands: inlineCommands
    }

    y.wrap(null)

    y.middleware((argv) => {
        argv.context = {
            yargs: y,
            loadableModules: loadableModules,
            inlineModules: inlineModules,
            loadableCommands: loadableCommands,
            inlineCommands: inlineCommands
        }
    })

    y.command({
        command: 'modules',
        describe: 'List loadable modules',

        handler: (argv) => {
            const { context } = argv
            const { modules } = context

            const list = Object.keys(modules).map((module) => [module, module.desc || module.describe || module.description || ''])

            if (list.length) {
                list.forEach(([name, description]) => console.info(name, '-', description))
            }
            else {
                console.warn('No modules available.')

                process.exit(1)
            }
        }
    })

    let commands = [].concat(loadableCommands.map(command => require(command)), inlineCommands)

    let promise

    commands.forEach(({yargs}) => {
        if (yargs) {
            let { handler = BLANK, ...options } = yargs

            handler = handler.bind(yargs)

            y.command({ ...options, handler: function (...args) {
                promise = new Promise(async function (resolve, reject) {
                    let result

                    try {
                        result = await handler(...args)
                    } catch (e) {
                        reject(e)
                    }

                    resolve(result)
                })
            }})
        }
    })

    y.help()

    y.demandCommand(1, 'You need to specify a command')

    y.parse()

    if (!promise) {
        promise = Promise.resolve()
    }

    return promise
}

module.exports = { execute }
