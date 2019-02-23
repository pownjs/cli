const assert = require('assert')
const { setTimeout } = require('timers')

const cli = require('../lib/cli')

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

describe('cli', () => {
    describe('#parse', () => {
        it('parses command', () => {
            assert.deepEqual(cli.parse('a b c'), ['a', 'b', 'c'])
        })

        it('parses command with envs', () => {
            assert.deepEqual(cli.parse(`a $B`, {}), ['a'])
            assert.deepEqual(cli.parse(`a $B`, { B: 'b' }), ['a', 'b'])
            assert.deepEqual(cli.parse(`a $B '$C'`, { B: 'b' }), ['a', 'b', '$C'])
            assert.deepEqual(cli.parse(`a $B '$C' "d $E"`, { B: 'b', E: 'e' }), ['a', 'b', '$C', 'd e'])
            assert.deepEqual(cli.parse(`a $B '$C' "d $E" $F`, { B: 'b', E: 'e', F: 'f g h' }), ['a', 'b', '$C', 'd e', 'f', 'g', 'h'])
        })
    })

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
