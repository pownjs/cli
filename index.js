const path = require('path')
const yargs = require('yargs')
const pownModules = require('pown-modules')

const main = (commands) => {
    let y = yargs.usage(`Usage: $0 <command> [options]`)

    commands.forEach(command => {
        const module = require(command)

        if (module.yargs) {
            y = y.command(module.yargs)
        }
    })

    y = y.demandCommand(1, 'You need at least one command before moving on').help()

    y.argv
}

const boot = (modules) => {
    let commands = []

    modules.forEach((module) => {
        const moduleCommands = module.config.commands

        if (!moduleCommands) {
            return
        }

        commands = commands.concat(moduleCommands.map(command => path.resolve(module.realpath, command)))
    })

    main(commands)
}

if (require.main === module) {
    pownModules.list((err, modules) => {
        if (err) {
            console.error(err.message || err)

            return
        }

        boot(modules)
    })
}
