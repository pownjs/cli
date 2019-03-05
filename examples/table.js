const { Table } = require('../lib/table')

const table = new Table()

table.push([1, 2, 3, 4, 5])
table.push([1, 2, 3, 4, 5])
table.push([1, 2, 3, 4, 5])

console.log(table.toString())
