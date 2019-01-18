const colors = require('./colors')

class Logger {
    constructor(argv) {
        // pass
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
        console.log(colors.red('X'), ...args)
    }
}

module.exports = { Logger }
