#!/usr/bin/env node

const modules = require('@pown/modules')

const colors = require('../lib/colors')
const { execute } = require('../lib/cli')

const boot = async({ loadableModules, loadableCommands }) => {
    const log = console.log.bind(console)

    console.info = function(...args) {
        // NOTE: should we handle multiline

        log(colors.green('*'), ...args)
    }

    console.warn = function(...args) {
        // NOTE: should we handle multiline

        log(colors.yellow('!'), ...args)
    }

    console.error = function(...args) {
        // NOTE: should we handle multiline
        // NOTE: will effect yargs usage output

        log(colors.red('x'), ...(process.env.DEBUG ? args : args.map((error) => {
            return error && error.message ? error.message : error
        })))
    }

    await execute(process.argv.slice(2), { loadableModules, loadableCommands })
}

modules.extract(async(err, modules) => {
    if (err) {
        console.error(err)
    }
    else {
        await boot(modules)
    }
})
