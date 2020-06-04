const process = require('process')
const readline = require('readline')

const makeLineIterator = (input) => {
    if (input === true || input === '-') {
        rl = readline.createInterface({
            input: process.stdin
        })

        return async function*() {
            for await (let line of rl) {
                yield line
            }
        }
    }
    else {
        return function*() {
            if (typeof(input[Symbol.iterator]) === 'function') {
                yield* input
            }
            else {
                yield input
            }
        }
    }
}

module.exports = { makeLineIterator }
