'use strict'

const request = require('request')
const Build = require('./build')
const utils = require('./utils')
const chalk = require('chalk')
const buildActions = require('jenkins-actions')
const Printer = require('./printer')
const tapParser = require('tap-parser')
const async = require('async')

module.exports = BuildResults

function BuildResults(opts) {
  if (!(this instanceof BuildResults))
    return new BuildResults(opts)

  opts = opts || {}
  this.opts = opts
  this.id = opts.id
  this.depth = opts.depth || 5
  this.creds = {
    username: opts.user
  , password: opts.token
  }

  this.status = ''
  this.duration = ''
  this.url = this.getUrl()
  this.rebaseOnto = ''
  this.startedBy = ''
  this.prUrl = ''
  this.jobName = opts.jobName
  this.results = null
  this.headers = []
  this.params = {}
  this.build = null
}

BuildResults.prototype.getUrl = function getUrl() {
  const job = this.jobName || 'node-test-pull-request'
  return utils.getBuildUrl(this.id, job, this.depth)
}

BuildResults.prototype.fetch = function fetch(cb) {
  const opts = {
    uri: this.getUrl()
  , json: true
  , auth: this.creds
  }

  request.get(opts, (err, res, body) => {
    if (err) return cb(err)
    if (res.statusCode !== 200) {
      const er = new Error(`Received non-200 status code: ${res.statusCode}`)
      er.body = body
      er.url = opts.uri
      return cb(er)
    }

    this.process(body)

    // TODO(evanlucas)
    // When we can get individual tap results for a specific run
    // fetch the tap results for failed builds for citgm.

    cb()
  })
}

BuildResults.prototype.buildToJSON = function buildToJSON(build) {
  build = build || this.build
  const out = {
    label: utils.formatType(build.result, build.name)
  , nodes: build.nodes.map((i) => {
      return this.buildToJSON(i)
    })
  }

  if (build.duration)
    out.label += `  (${build.duration})`

  if (build.url && build.result === 'FAILURE' && !build.nodes.length) {
    out.label += `  [${chalk.underline(build.url)}]`
  }

  return out
}

BuildResults.prototype.process = function process(res) {
  const job = this.jobName
  this.results = res
  const build = new Build(res, job)
  this.build = build
  this.status = res.building
    ? 'BUILDING'
    : res.result

  this.duration = utils.parseMS(res.duration) || build.duration
  const actions = buildActions(res)
  if (!actions) {
    throw new Error('Unable to parse results')
  }

  const params = actions.parameters
  this.params = params
  this.rebaseOnto = params.REBASE_ONTO
  this.startedBy = actions.startedBy

  this.addHeader('status', this.status)
  this.addHeader('duration', this.duration)
  this.addHeader('url', res.url)
  this.addHeader('id', res.id)
  this.addHeader('rebase onto', this.rebaseOnto)
  this.addHeader('started by', this.startedBy)

  const prUrl = utils.buildPRUrl(params)
  if (prUrl) {
    this.prUrl = prUrl
    this.addHeader('pull request', prUrl)
  }

  this.addParam('GIT_REMOTE_REF', 'remote ref')
  this.addParam('CITGM_LOGLEVEL', 'citgm log level')
  this.addParam('CITGM', 'citgm')
  this.addParam('CITGM_COMMAND', 'citgm command')
}

BuildResults.prototype.addHeader = function addHeader(heading, val) {
  this.headers.push({
    heading: heading
  , value: val
  })
}

// Adds a param as a header if it exists
BuildResults.prototype.addParam = function addParam(key, title) {
  if (this.params[key]) {
    this.addHeader(title, this.params[key])
  }
}

BuildResults.prototype.fetchTapResults = function fetchTapResults(cb) {
  const self = this

  async.map(this.build.nodes, function(node, cb) {
    self.fetchCITGMTap(node.url, function(err, results) {
      if (err) return cb(err)
      cb(null, node)
    })
  }, cb)
}

// Don't use this until we can get an individual run's tap results
// Currently, we can only get the latest
BuildResults.prototype.fetchCITGMTap = function fetchCITGMTap(url, cb) {
  const uri = `${url}ws/smoker/test.tap/*view*/`
  const opts = {
    uri: uri
  , auth: this.creds
  }
  const req = request.get(opts)
  req.on('error', cb)

  const parser = tapParser((res) => {
    console.log()
    cb(null, res)
  })
  req.on('data', function(data) {
    console.log('data', data.toString())
  })
  req.pipe(parser)
}

BuildResults.prototype.print = function print() {
  if (!this.results) {
    console.log('Unable to process results')
    return
  }

  const printer = new Printer(this)
  printer.print()
}
