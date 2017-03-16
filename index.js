#!/usr/bin/env node

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

    y = y.demandCommand(1, 'You need to specify a command').help()

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

if (process.env.POWN_ROOT) {
    pownModules.list(process.env.POWN_ROOT, (err, modules) => {
        if (err) {
            console.error(err.message || err)

            return
        }

        boot(modules)
    })
} else {
    pownModules.list((err, modules) => {
        if (err) {
            console.error(err.message || err)

            return
        }

        boot(modules)
    })
}
