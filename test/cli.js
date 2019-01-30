const timers = require('timers')
const assert = require('assert')

const cli = require('../lib/cli')

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

describe('cli', () => {
    it('#execute', async() => {
        const inlineCommands = [
            {
                yargs: {
                    command: 'test',
                    describe: 'test',

                    handler: async() => {
                        await sleep(1000)
                    }
                }
            }
        ]

        await cli.execute('test', { inlineCommands })
    }).timeout(2000)
})
