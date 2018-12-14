#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const modules = require('@pown/modules')

const main = ({loadableModules, loadableCommands}) => {
    let y = yargs.usage(`Usage: $0 [options] <command> [command options]`)

    y.context = {
        yargs: y,
        modules: loadableModules,
        commands: loadableCommands
    }

    y = y.options('modules', {
        alias: 'm',
        type: 'string',
        describe: 'Load modules'
    })

    y = y.middleware((argv) => {
        argv.context = {
            yargs: y,
            modules: loadableModules,
            commands: loadableCommands
        }

        if (argv.modules) {
            argv.modules.split(',').forEach((name) => {
                name = name.trim()

                if (name === '*') {
                    Object.values(modules).forEach(module => require(module))
                }
                else {
                    const module = modules[name]

                    if (module) {
                        require(module)
                    }
                    else {
                        yargs
                            .epilog(`Unrecognized module ${name}.`)
                            .showHelp()

                        process.exit(1)
                    }
                }
            })
        }
    })

    y = y.command({
        command: 'modules',
        describe: 'List loadable modules',

        handler: (argv) => {
            const { context } = argv
            const { yargs, modules } = context

            const { Logger } = require('../lib/logger')

            const logger = new Logger(argv)

            const list = Object.keys(modules).map((module) => [module, module.desc || module.describe || module.description || ''])

            if (list.length) {
                list.forEach(([name, description]) => logger.verbose(name, '-', description))
            } else {
                logger.warn('No modules available.')

                process.exit(1)
            }
        }
    })

    loadableCommands.forEach((command) => {
        const module = require(command)

        if (module.yargs) {
            y = y.command(module.yargs)
        }
    })

    y = y.help()
    y = y.demandCommand(1, 'You need to specify a command')

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

    main({loadableModules, loadableCommands})
}

modules.list((err, modules) => {
    if (err) {
        console.error(err)
    }
    else {
        boot(modules)
    }
})
