#!/usr/bin/env node

const path = require('path')
const modules = require('@pown/modules')

const colors = require('../lib/colors')
const { execute } = require('../lib/cli')

const boot = async(modules) => {
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

    const log = console.log.bind(console)

    console.info = function(...args) {
        log(colors.green('*'), ...args)
    }

    console.warn = function(...args) {
        log(colors.yellow('!'), ...args)
    }

    console.error = function(...args) {
        log(colors.red('x'), ...(process.env.DEBUG ? args : args.map((error) => {
            return error && error.message ? error.message : error
        })))
    }

    await execute(process.argv.slice(2), { loadableModules, loadableCommands })
}

modules.list(async(err, modules) => {
    if (err) {
        console.error(err)
    }
    else {
        await boot(modules)
    }
})
