'use strict'

module.exports = Artifact

function Artifact(opts) {
  this.path = opts.displayPath || opts.fileName
}
