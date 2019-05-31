#!/usr/bin/env node

const modules = require('@pown/modules')

const colors = require('../lib/colors')
const { Table } = require('../lib/table')
const { execute } = require('../lib/cli')

const boot = async({ loadableModules, loadableCommands }) => {
    const log = console.warn.bind(console)

    console.debug = function(...args) {
        // NOTE: should we handle multiline
        // NOTE: will effect yargs usage output

        log(colors.green('%'), ...args)
    }

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

    console.table = function(data, properties = null, options = {}) {
        switch (process.env.POWN_TABLE_OUTPUT_FORMAT) {
            case 'raw':
                log(data)

                return

            case 'json':
                log(JSON.stringify(data, '', '  '))

                return
        }

        if (!Array.isArray(data)) {
            data = [data]
        }

        const { span = true, wrap = true } = options

        const head = properties || Array.from(new Set(data.reduce((a, v) => {
            return a.concat(Object.keys(v))
        }, [])))

        const screenWidth = Math.max(78, Math.floor(process.stdout.columns * 0.8))

        const colSize = Math.floor(screenWidth / head.length) - 1
        const colWidth = 2.0 * Math.round(colSize / 2.0)

        const table = new Table({
            head: head,
            wordWrap: wrap,
            colWidths: Array(head.length).fill(colWidth)
        })

        if (span) {
            data.forEach((entry) => {
                entry = head.map((n) => entry[n] ? entry[n].toString() : '')

                for (let i = entry.length - 1, j = entry.length - 1; i >= 0; i--) {
                    if (entry[i]) {
                        const span = j - i + 1

                        if (span > 1) {
                            entry[i] = { content: entry[i], colSpan: span }
                        }

                        j = i - 1
                    }
                }

                entry = entry.filter(i => i)

                table.push(entry)
            })
        }
        else {
            data.forEach((entry) => {
                entry = head.map((n) => entry[n] ? entry[n].toString() : '')

                table.push(entry)
            })
        }

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
