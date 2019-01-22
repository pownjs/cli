const colors = require('./colors')

class Logger {
    constructor(argv) {
        const { debug } = argv

        this.debug = debug
    }

    verbose(...args) {
        console.log(...args)
    }

    info(...args) {
        console.log(colors.green('*'), ...args)
    }

    warn(...args) {
        console.log(colors.yellow('!'), ...args)
    }

    error(...args) {
        console.log(colors.red('x'), ...(this.debug ? args : args.map((error) => {
            return error && error.message ? error.message : error
        })))
    }
}

module.exports = { Logger }
