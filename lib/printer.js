'use strict'

const utils = require('./utils')
const chalk = require('chalk')
const columnify = require('columnify')
const archy = require('archy')

module.exports = Printer

function Printer(obj) {
  if (!(this instanceof Printer))
    return new Printer(obj)

  this.obj = obj
}

Printer.prototype.print = function print() {
  this.printHeader()
  this.printBody()
}

Printer.prototype.printHeader = function printHeader() {
  if (this.obj.headers) {
    const headers = this.obj.headers.map((item) => {
      if (item.heading === 'status') {
        item.value = utils.formatType(item.value)
      }
      item.heading = chalk.cyan(`     ${item.heading}  `)
      return item
    })
    console.log(columnify(headers, {
      showHeaders: false
    , config: {
        heading: {
          align: 'right'
        }
      }
    }))
    console.log()
  }
}

Printer.prototype.printBody = function printBody() {
  console.log(archy(this.obj.buildToJSON()))
}
