'use strict'

const test = require('tap').test
const Build = require('../lib/build')

test('Build', (t) => {
  let build = Build({
    fullDisplayName: 'test'
  , duration: '0'
  , timestamp: Date.now()
  , url: 'job/node-test-commit/1423'
  , build: {
      subBuilds: [
        { jobName: 'test » biscuits #102'
        , duration: 1000
        , url: 'https://ci.nodejs.org/job/node-test-thing/102'
        , result: 'SUCCESS'
        }
      , {}
      ]
    }
  })
  t.type(build, Build)
  t.equal(build.name, 'test')
  t.equal(build.parent, undefined)
  t.equal(build.result, 'BUILDING')
  t.match(build.duration, /and counting/)
  t.equal(build.url, 'https://ci.nodejs.org/job/node-test-commit/1423')
  t.equal(build.nodes.length, 1)

  build = new Build({
    fullDisplayName: 'test'
  , duration: '0'
  , timestamp: Date.now()
  , url: 'job/node-test-commit/1423'
  , build: {
      runs: [
        { jobName: 'test » biscuits #102'
        , duration: 1000
        , url: 'https://ci.nodejs.org/job/node-test-thing/102'
        , result: 'SUCCESS'
        }
      , {}
      ]
    }
  }, null, 'run', null)
  t.equal(build.name, 'test')
  t.equal(build.result, 'BUILDING')
  t.match(build.duration, /and counting/)
  t.equal(build.url, 'https://ci.nodejs.org/job/node-test-commit/1423')
  t.equal(build.nodes.length, 1)
  t.equal(build.type, 'run')

  build = new Build({
    duration: 1000
  , subBuilds: []
  }, 'node-test-pull-request')
  t.equal(build.name, 'node-test-pull-request')
  t.end()
})
