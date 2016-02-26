'use strict'

const utils = require('./utils')

module.exports = Build

function Build(obj, name, type, parent) {
  if (!(this instanceof Build))
    return new Build(obj, name, type, parent)

  this.name = name || obj.jobName || obj.fullDisplayName
  this.parent = parent
  this.result = (!obj.result || obj.building) ? 'BUILDING' : obj.result
  this.duration = typeof obj.duration === 'number'
    ? utils.parseMS(obj.duration)
    : obj.duration

  if (+obj.duration === 0 && obj.timestamp) {
    const ms = Date.now() - (new Date(obj.timestamp)).getTime()
    this.duration = utils.parseMS(ms) + ' and counting'
  }
  this.nodes = []
  this.main = true
  this.type = type || 'build'
  this.url = obj.url
  // this is a bad way, but it works for now
  if (this.url && this.url[0] !== 'h') {
    this.url = `${utils.ciURL}/${this.url}`
  }

  if (this.type === 'run' && this.parent) {
    this.name = this.name.replace(this.parent.name + ' » ', '').split('#')[0].trim()
  }

  let builds = []
  let runs = []
  if (obj.build && Array.isArray(obj.build.subBuilds)) {
    this.main = false
    builds = obj.build.subBuilds
  } else if (obj.build && Array.isArray(obj.build.runs)) {
    this.main = false
    runs = obj.build.runs
  } else if (obj.runs && Array.isArray(obj.runs)) {
    this.main = true
    runs = obj.runs
  } else if (Array.isArray(obj.subBuilds)) {
    builds = obj.subBuilds
  }

  builds.forEach((item) => {
    this.addChild(item, 'subbuild')
  })

  runs.forEach((item) => {
    this.addChild(item, 'run')
  })

  this.tap = null
}

Build.prototype.addChild = function addChild(obj, type) {
  if (!obj.hasOwnProperty('duration'))
    return

  const child = new Build(obj, null, type, this)
  this.nodes.push(child)
}
