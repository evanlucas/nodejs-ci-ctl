'use strict'

const parse = require('parse-ms')
const chalk = require('chalk')

exports.ciURL = 'https://ci.nodejs.org'

exports.getBuildUrl = function getBuildUrl(id, job, depth) {
  depth = depth || 5
  job = job || 'node-test-pull-request'
  const u = exports.ciURL
  return `${u}/job/${job}/${id}/api/json?depth=${depth}`
}

exports.parseMS = function parseMS(m) {
  const a = parse(m)
  let out = ''
  if (a.days)
    out += `${a.days} day `

  if (a.hours)
    out += `${a.hours} hr `

  if (a.minutes)
    out += `${a.minutes} min `

  if (a.seconds)
    out += `${a.seconds} sec`

  return out.trim()
}

exports.formatType = function formatType(type, name) {
  name = name || type
  switch (type) {
    case 'FAILURE':
      return chalk.red(name)
    case 'SUCCESS':
      return chalk.green(name)
    case 'UNSTABLE':
      return chalk.yellow(name)
    case 'ABORTED':
      return chalk.inverse(name)
    case 'BUILDING':
      return chalk.bold.magenta(name)
    default:
      return name
  }
}

exports.buildPRUrl = function buildPRUrl(params) {
  if (!params.PR_ID) return null

  const org = params.TARGET_GITHUB_ORG || params.GITHUB_ORG
  if (!org) return null

  const repo = params.TARGET_REPO_NAME || params.REPO_NAME
  if (!repo) return null

  const orgRepo = `${org}/${repo}`
  return `https://github.com/${orgRepo}/pull/${params.PR_ID}`
}
