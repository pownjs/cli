#!/usr/bin/env node

const modules = require('@pown/modules')

const colors = require('../lib/colors')
const { Table } = require('../lib/table')
const { execute } = require('../lib/cli')

const boot = async({ loadableModules, loadableCommands }) => {
    const log = console.log.bind(console)

    console.info = function(...args) {
        // NOTE: should we handle multiline
        // NOTE: will effect yargs usage output

        log(colors.green('*'), ...args)
    }

    console.warn = function(...args) {
        // NOTE: should we handle multiline
        // NOTE: will effect yargs usage output

        log(colors.yellow('!'), ...args)
    }

    console.error = function(...args) {
        // NOTE: should we handle multiline
        // NOTE: will effect yargs usage output

        log(colors.red('x'), ...(process.env.DEBUG ? args : args.map((error) => {
            return error && error.message ? error.message : error
        })))
    }

    console.table = function(data, properties) {
        const head = properties || Array.from(new Set(data.reduce((a, v) => {
            return a.concat(Object.keys(v))
        }, [])))

        const table = new Table({
            head: head
        })

        data.forEach((entry) => {
            table.push(head.map((n) => entry[n]))
        })

        log(table.toString())
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
