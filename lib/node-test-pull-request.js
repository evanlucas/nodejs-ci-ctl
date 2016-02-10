'use strict'

const request = require('request')
const Build = require('./build')
const utils = require('./utils')
const chalk = require('chalk')
const columnify = require('columnify')
const archy = require('archy')

module.exports = NodeTestPR

function NodeTestPR(opts) {
  if (!(this instanceof NodeTestPR))
    return new NodeTestPR(opts)

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
}

NodeTestPR.prototype.getUrl = function getUrl() {
  return utils.getBuildUrl(this.id, 'node-test-pull-request', this.depth)
}

NodeTestPR.prototype.fetch = function fetch(cb) {
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
      return cb(er)
    }

    cb(null, body)
  })
}

NodeTestPR.prototype.buildToJSON = function buildToJSON(build) {
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

NodeTestPR.print = function(opts) {
  const pr = new NodeTestPR(opts)
  pr.fetch((err, res) => {
    if (err) throw err
    const data = []

    const build = new Build(res, 'node-test-pull-request')

    pr.status = res.building
      ? utils.formatType('BUILDING')
      : utils.formatType(res.result)

    pr.duration = utils.parseMS(res.duration) || build.duration
    const params = utils.getBuildParams(res)
    pr.rebaseOnto = params.rebaseOnto
    pr.startedBy = params.startedBy
    pr.prUrl = params.prUrl

    printLine('status', pr.status)
    printLine('duration', pr.duration)
    printLine('url', res.url)
    printLine('id', res.id)
    printLine('rebase onto', pr.rebaseOnto)
    printLine('started by', pr.startedBy)
    printLine('pull request', pr.prUrl)

    console.log(columnify(data, {
      showHeaders: false
    , config: {
        heading: {
          align: 'right'
        }
      }
    }))

    console.log()

    console.log(archy(pr.buildToJSON(build)))

    function printLine(heading, val) {
      data.push({
        heading: chalk.cyan(`     ${heading}  `)
      , value: val
      })
    }
  })
}
