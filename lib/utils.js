'use strict'

const parse = require('parse-ms')
const chalk = require('chalk')

exports.ciURL = 'https://ci.nodejs.org'

exports.getBuildUrl = function getBuildUrl(id, depth) {
  depth = depth || 5
  const u = exports.ciURL
  return `${u}/job/node-test-pull-request/${id}/api/json?depth=${depth}`
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

exports.transformParams = function transformParams(input) {
  if (!Array.isArray(input)) return {}
  return input.reduce((set, item) => {
    set[item.name] = item.value
    return set
  }, {})
}

exports.getBuildParams = function getBuildParams(results) {
  const actions = results.actions
  if (!actions) return null
  const out = {
    pr: null
  , rebaseOnto: null
  , startedBy: ''
  , prUrl: ''
  }

  for (var i = 0; i < actions.length; i++) {
    const act = actions[i]
    if (act.parameters) {
      const params = exports.transformParams(act.parameters)
      if (!params) continue
      const org = params.TARGET_GITHUB_ORG
      const repo = `${org}/${params.TARGET_REPO_NAME}`
      out.pr = params.PR_ID
      out.prUrl = `https://github.com/${repo}/pulls/${params.PR_ID}`
      out.rebaseOnto = params.REBASE_ONTO
    } else if (act.causes) {
      if (act.causes.length) {
        const c = act.causes[0]
        if (c.userName && c.userId) {
          out.startedBy = `${c.userName} (@${c.userId})`
        }
      }
    }
  }

  return out
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
    default:
      return name
  }
}
