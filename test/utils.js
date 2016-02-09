'use strict'

const test = require('tap').test
const utils = require('../lib/utils')
const chalk = require('chalk')

test('getBuildUrl', (t) => {
  const id = 1234
  const d = 3
  const out = utils.getBuildUrl(id, d)
  const u = utils.ciURL
  t.equal(out, `${u}/job/node-test-pull-request/1234/api/json?depth=3`)
  t.end()
})

test('parseMS', (t) => {
  const input = 423422342
  const out = utils.parseMS(input)
  t.equal(out, '4 day 21 hr 37 min 2 sec')
  t.end()
})

test('transformParams', (t) => {
  const input = [
    { name: 'test', value: 1 }
  , { name: 'biscuits', value: 2 }
  ]

  t.deepEqual(utils.transformParams(input), {
    test: 1
  , biscuits: 2
  })

  t.deepEqual(utils.transformParams([]), {})
  t.deepEqual(utils.transformParams(null), {})
  t.end()
})

test('getBuildParams', (t) => {
  const input = {
    actions: [
      {
        parameters: [
          { name: 'TARGET_GITHUB_ORG', value: 'nodejs' }
        , { name: 'TARGET_REPO_NAME', value: 'node' }
        , { name: 'PR_ID', value: '5162' }
        , { name: 'POST_STATUS_TO_PR', value: true }
        , { name: 'REBASE_ONTO', value: '' }
        ]
      }
    , {
        causes: [
          {
            shortDescription: 'Started by user Evan Lucas'
          , userId: 'evanlucas'
          , userName: 'Evan Lucas'
          }
        ]
      }
    , {}
    ]
  }

  const out = utils.getBuildParams(input)
  t.deepEqual(out, {
    pr: '5162'
  , rebaseOnto: ''
  , startedBy: 'Evan Lucas (@evanlucas)'
  , prUrl: 'https://github.com/nodejs/node/pulls/5162'
  })

  t.equal(utils.getBuildParams({}), null)
  t.end()
})

test('formatType', (t) => {
  t.equal(utils.formatType('FAILURE'), chalk.red('FAILURE'))
  t.equal(utils.formatType('FAILURE', 'a'), chalk.red('a'))

  t.equal(utils.formatType('SUCCESS'), chalk.green('SUCCESS'))
  t.equal(utils.formatType('SUCCESS', 'a'), chalk.green('a'))

  t.equal(utils.formatType('UNSTABLE'), chalk.yellow('UNSTABLE'))
  t.equal(utils.formatType('UNSTABLE', 'a'), chalk.yellow('a'))

  t.equal(utils.formatType('biscuits'), 'biscuits')
  t.equal(utils.formatType('biscuits', 'a'), 'a')
  t.end()
})
