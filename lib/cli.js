const yargs = require('yargs/yargs')

const BLANK = function() {}

const execute = (args, options = {}) => {
    const { command, loadableModules = {}, inlineModules = {}, loadableCommands = [], inlineCommands = [] } = options

    const y = yargs(args)

    if (command) {
        y.$0 = command
    }

    let promise

    y.command = (function(command) {
        return function(options) {
            let { handler = BLANK } = options

            handler = handler.bind(yargs)

            return command.call(this, {
                ...options,

                handler: function(...args) {
                    promise = new Promise(async function(resolve, reject) {
                        let result

                        try {
                            result = await handler(...args)
                        }
                        catch (e) {
                            reject(e)
                        }

                        resolve(result)
                    })
                }
            })
        }
    })(y.command)

    y.usage(`$0 [options] <command> [command options]`)

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

    const commands = [].concat(loadableCommands.map(command => require(command)), inlineCommands)

    commands.forEach(({ yargs }) => {
        if (yargs) {
            y.command(yargs)
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
