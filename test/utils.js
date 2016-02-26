'use strict'

const test = require('tap').test
const utils = require('../lib/utils')
const chalk = require('chalk')

test('getBuildUrl', (t) => {
  const id = 1234
  const d = 3
  const out = utils.getBuildUrl(id, 'node-test-pull-request', d)
  const u = utils.ciURL
  t.equal(out, `${u}/job/node-test-pull-request/1234/api/json?depth=3`)

  const out2 = utils.getBuildUrl(id)
  t.equal(out2, `${u}/job/node-test-pull-request/1234/api/json?depth=5`)
  t.end()
})

test('parseMS', (t) => {
  const input = 423422342
  const out = utils.parseMS(input)
  t.equal(out, '4 day 21 hr 37 min 2 sec')
  t.end()
})

test('formatType', (t) => {
  t.equal(utils.formatType('FAILURE'), chalk.red('FAILURE'))
  t.equal(utils.formatType('FAILURE', 'a'), chalk.red('a'))

  t.equal(utils.formatType('SUCCESS'), chalk.green('SUCCESS'))
  t.equal(utils.formatType('SUCCESS', 'a'), chalk.green('a'))

  t.equal(utils.formatType('UNSTABLE'), chalk.yellow('UNSTABLE'))
  t.equal(utils.formatType('UNSTABLE', 'a'), chalk.yellow('a'))

  t.equal(utils.formatType('ABORTED'), chalk.inverse('ABORTED'))
  t.equal(utils.formatType('ABORTED', 'a'), chalk.inverse('a'))

  t.equal(utils.formatType('BUILDING'), chalk.bold.magenta('BUILDING'))
  t.equal(utils.formatType('BUILDING', 'a'), chalk.bold.magenta('a'))

  t.equal(utils.formatType('biscuits'), 'biscuits')
  t.equal(utils.formatType('biscuits', 'a'), 'a')
  t.end()
})

test('buildPRUrl', (t) => {
  const params = {
    TARGET_GITHUB_ORG: 'nodejs'
  , TARGET_REPO_NAME: 'node'
  , PR_ID: '1479'
  }

  t.equal(utils.buildPRUrl(params), 'https://github.com/nodejs/node/pull/1479')
  t.end()
})
