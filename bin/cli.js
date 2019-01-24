#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const modules = require('@pown/modules')

const colors = require('../lib/colors')

const main = ({ loadableModules, loadableCommands }) => {
    let y = yargs.usage(`Usage: $0 [options] <command> [command options]`)

    y.context = {
        yargs: y,
        modules: loadableModules,
        commands: loadableCommands
    }

    y = y.wrap(null)

    y = y.middleware((argv) => {
        argv.context = {
            yargs: y,
            modules: loadableModules,
            commands: loadableCommands
        }
    })

    y = y.options('debug', {
        type: 'boolean',
        describe: 'Debug mode'
    })

    y = y.middleware((argv) => {
        const log = console.log.bind(console)

        console.info = function(...args) {
            log(colors.green('*'), ...args)
        }

        console.warn = function(...args) {
            log(colors.yellow('!'), ...args)
        }

        console.error = function(...args) {
            log(colors.red('x'), ...(argv.debug ? args : args.map((error) => {
                return error && error.message ? error.message : error
            })))
        }
    })

    y = y.command({
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

    main({ loadableModules, loadableCommands })
}

modules.list((err, modules) => {
    if (err) {
        console.error(err)
    }
    else {
        boot(modules)
    }
})
