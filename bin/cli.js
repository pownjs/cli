#!/usr/bin/env node

const process = require('process')
const { extract } = require('@pown/modules')

const Table = require('../lib/table')
const colors = require('../lib/colors')
const { execute } = require('../lib/cli')

const boot = async() => {
    const { loadableModules, loadableCommands } = await extract()

    const consoleDef = {
        debug: ['%', 'green'],
        info: ['*', 'green'],
        warn: ['!', 'yellow'],
        error: ['x', 'red']
    }

    switch (process.env.POWN_CONSOLE_OUTPUT_FORMAT) {
        case 'raw':
            break

        case 'json':
            Object.keys(consoleDef).forEach((type) => {
                console[type] = ((fn) => (...args) => {
                    fn(JSON.stringify({ type, data: (args.length > 1 ? args : args[0]) }))
                })(console[type])
            })

            break

        default:
            Object.entries(consoleDef).forEach(([type, [symbol, color]]) => {
                console[type] = ((fn) => (...args) => {
                    fn(colors[color](symbol), ...args)
                })(console[type])
            })
    }

    if (process.env.POWN_DEBUG || process.env.POWN_DEBUG_XXL) {
        if (!process.env.POWN_DEBUG_XXL) {
            console.debug = ((fn) => (...args) => {
                fn(...args.map(data => data && Buffer.isBuffer(data) ? data.slice(0, 512) : data))
            })(console.debug)
        }
    }
    else {
        console.debug = () => {}

        console.error = ((fn) => (...args) => {
            fn(...args.map(error => error && error.message ? error.message : error))
        })(console.error)
    }

    switch (process.env.POWN_CONSOLE_TABLE_OUTPUT_FORMAT || process.env.POWN_CONSOLE_OUTPUT_FORMAT) {
        case 'raw':
            console.table = (data) => console.log(data)

            break

        case 'json':
            console.table = (data) => console.log(JSON.stringify({ type: 'table', data: data }))

            break

        default:
            console.table = (data, properties = null, options = {}) => {
                if (!Array.isArray(data)) {
                    data = Object.entries(data).map(([key, value]) => ({ key, value }))
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

                console.log(table.toString())
            }
    }

    await execute(process.argv.slice(2), { loadableModules, loadableCommands })
}

boot().catch((error) => {
    console.error(error)

    process.exit(1)
})
