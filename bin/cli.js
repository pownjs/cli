#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const modules = require('@pown/modules')

const main = (m, c) => {
    let y = yargs.usage(`Usage: $0 [options] <command> [command options]`)

    y.context = {
        yargs: y,
        modules: m,
        commands: c
    }

    const commandModules = require('../lib/commands/modules')
    const commandText = require('../lib/commands/text')

    if (commandModules.yargs) {
        y = y.command(commandModules.yargs)
    }

    if (commandText.yargs) {
        y = y.command(commandText.yargs)
    }

    y = y.options('modules', {
        alias: 'm',
        type: 'string',
        describe: 'Load modules'
    })

    y = y.options('text', {
        alias: 't',
        type: 'boolean',
        describe: 'Start in text mode'
    })

    y = y.middleware((argv) => {
        argv.context = {
            yargs: y,
            modules: m,
            commands: c
        }

        if (argv.modules) {
            commandModules.argv(argv)
        }

        if (argv.text) {
            commandText.argv(argv)
        }
    })

    c.forEach((command) => {
        const module = require(command)

        if (module.yargs) {
            y = y.command(module.yargs)
        }
    })

    y = y.alias('v', 'version')

    y = y.demandCommand(1, 'You need to specify a command')

    y = y.help()
    y = y.alias('h', 'help')

    y.argv
}

const boot = (modules) => {
    let loadableModules = {}
    let loadableCommands = []

    modules.forEach((module) => {
        if (module.config.main) {
            loadableModules[module.package.name] = path.resolve(module.realpath, module.config.main)
        }

        if (module.config.command) {
            loadableCommands = loadableCommands.concat([path.resolve(module.realpath, module.config.command)])
        }

        if (module.config.commands) {
            loadableCommands = loadableCommands.concat(module.config.commands.map(command => path.resolve(module.realpath, command)))
        }
    })

    main(loadableModules, loadableCommands)
}

modules.list((err, modules) => {
    if (err) {
        console.error(err)
    }
    else {
        boot(modules)
    }
})
