const yargs = require('yargs/yargs')
const yargsParser = require('yargs-parser/lib/tokenize-arg-string')

const BLANK = function() {}

const pass1 = (input, env) => {
    input = input.replace(/\$(?:[\w_]+|[@])/g, (i) => {
        return env[i.slice(1)] || ''
    })

    input = input.replace(/\$\{(?:[\w_]+|[@])\}/g, (i) => {
        return env[i.slice(2, -1)] || ''
    })

    return input
}

const pass2 = (input, env) => {
    input = input.split(/(\$(?:[\w_]+|[@])|\$\{(?:[\w_]+|[@])\})/g).map(i => pass1(i, env))

    input = input.join(' ')

    return yargsParser(input)
}

const parse = (input, env = {}) => {
    const args = []

    yargsParser(input).forEach((arg) => {
        if (arg.startsWith(`"`) && arg.endsWith(`"`)) {
            args.push(pass1(arg.slice(1, -1), env))
        }
        else
        if (arg.startsWith(`'`) && arg.endsWith(`'`)) {
            args.push(arg.slice(1, -1))
        }
        else {
            args.push(...pass2(arg, env))
        }
    })

    return args
}

const execute = (args, options = {}) => {
    const { command, loadableModules = {}, inlineModules = {}, loadableCommands = [], inlineCommands = [], file = '' } = options

    const y = yargs(args)

    y.env('POWN')

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
        inlineCommands: inlineCommands,
        file: file
    }

    y.wrap(null)

    y.middleware((argv) => {
        argv.context = {
            yargs: y,
            loadableModules: loadableModules,
            inlineModules: inlineModules,
            loadableCommands: loadableCommands,
            inlineCommands: inlineCommands,
            file: file
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

module.exports = { execute, parse }
