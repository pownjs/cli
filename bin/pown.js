#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const pownModules = require('@pown/modules')

const main = (modules, commands) => {
    let y = yargs.usage(`Usage: $0 [options] <command> [command options]`)

    y = y.command({
        command: 'modules',
        describe: 'List loadable modules',

        builder: {
        },

        handler: (argv) => {
            Object.keys(modules).forEach(module => console.log(module, '-', module.desc || module.describe || module.description || ''))
        }
    })

    y = y.options('modules', {
        alias: 'm',
        type: 'string',
        describe: 'Load modules'
    })

    commands.forEach(command => {
        const module = require(command)

        if (module.yargs) {
            y = y.command(module.yargs)
        }
    })

    y = y.demandCommand(1, 'You need to specify a command').help()

    const argv = y.argv

    if (argv.modules) {
        argv.modules.split(',').forEach((name) => {
            name = name.trim()

            if (name === '*') {
                Object.values(modules).forEach(module => require(module))
            } else {
                const module = modules[name]

                if (module) {
                    require(module)
                } else {
                    y = y.epilog(`Unrecognized module ${name}.`)
                    y = y.showHelp()

                    process.exit(1)
                }
            }
        })
    }
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

pownModules.list((err, modules) => {
    if (err) {
        console.error(err.message || err)

        return
    }

    boot(modules)
})
