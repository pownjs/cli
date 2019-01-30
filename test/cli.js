const timers = require('timers')
const assert = require('assert')

const cli = require('../lib/cli')

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

describe('cli', () => {
    describe('#execute', () => {
        it('handles undefined handlers', async() => {
            const inlineCommands = [
                {
                    yargs: {
                        command: 'test',
                        describe: 'test',
                    }
                }
            ]

            await cli.execute('test', { inlineCommands })
        })

        it('execs async', async() => {
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
})
