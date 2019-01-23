const _Table = require('cli-table2')

class Table extends _Table {
    constructor(...args) {
        super(...args)

        console.warn('Table deprecation notice')
    }
}

module.exports = { Table }
