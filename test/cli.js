const { setTimeout } = require('timers')

const cli = require('../lib/cli')

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

describe('cli', () => {
    describe('#execute', () => {
        it('handles undefined handlers', async() => {
            const inlineCommands = [{
                yargs: {
                    command: 'test',
                    describe: 'test',
                }
            }]

            await cli.execute('test', { inlineCommands })
        })

        it('execs async', async() => {
            const inlineCommands = [{
                yargs: {
                    command: 'foo',

                    handler: async() => {
                        await sleep(1000)
                    }
                }
            }]

            await cli.execute('foo', { inlineCommands })
        }).timeout(2000)

        it('execs async with subcommands', async() => {
            const inlineCommands = [{
                yargs: {
                    command: 'foo <subcommand>',

                    builder: (yargs) => {
                        yargs.command({
                            command: 'bar',

                            handler: async() => {
                                await sleep(1000)
                            }
                        })
                    }
                }
            }]

            await cli.execute('foo bar', { inlineCommands })
        }).timeout(2000)
    })
})
