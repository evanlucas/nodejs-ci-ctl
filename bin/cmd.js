#!/usr/bin/env node

'use strict'

const help = require('help')()
const ghauth = require('ghauth')
const ctl = require('../')
const pkg = require('../package')
const nopt = require('noptd')
const inquirer = require('inquirer')
const questions = require('./questions')

const BuildResults = ctl.BuildResults
const submitBuild = ctl.submitBuild

const knownOpts = {
  help: Boolean
, version: Boolean
, depth: Number
, job: String
, rebase: String
, org: String
, repo: String
, pr: Number
}

const shortHand = {
  h: ['--help']
, v: ['--version']
, d: ['--depth']
, j: ['--job']
, o: ['--org']
, r: ['--repo']
, p: ['--pr']
, R: ['--rebase']
}

const defs = {
  depth: 5
, job: 'node-test-pull-request'
}

const parsed = nopt(knownOpts, shortHand)(defs)

if (parsed.help) {
  return help()
}

if (parsed.version) {
  console.log('nodejs-ci-ctl', `v${pkg.version}`)
  return
}

const args = parsed.argv.remain

const cmd = args.shift()

if (!cmd) {
  return help(1)
}

if (cmd === 'help') {
  return help()
}

const authOpts = {
  scopes: ['read:org']
, configName: 'nodejs-ci-ctl'
}

ghauth(authOpts, (err, authData) => {
  if (err) throw err
  switch (cmd) {
    case 'fetch':
      const id = args.shift()
      return fetch(id, authData)
    case 'submit':
      return submit(authData)
    default:
      console.error('Invalid command')
      return help(1)
  }
})

function fetch(id, authData) {
  if (!id) {
    console.error('Missing id')
    return help(1)
  }

  let job = parsed.job
  if (job === 'citgm') {
    job = 'thealphanerd-tap-smoker'
  }

  const build = new BuildResults({
    id: id
  , depth: parsed.depth
  , user: authData.user
  , token: authData.token
  , jobName: job
  })

  build.fetch((err) => {
    if (err) throw err
    build.print()
  })
}

function submit(authData) {
  let qs
  switch (parsed.job) {
    case 'node-test-pull-request':
      qs = questions.submit['node-test-pull-request']
      break
    case 'cigtm':
      qs = questions.submit.citgm
      break
    default:
      console.error('Invalid job type')
      process.exit(1)
  }
  inquirer.prompt(qs, (answers) => {
    let job = parsed.job
    if (job === 'citgm') {
      job = 'thealphanerd-tap-smoker'
    }
    if (job === 'node-test-pull-request' && !answers.CERTIFY_SAFE) {
      console.error('Please explicitly mark CERTIFY_SAFE as true')
      process.exit(1)
    }
    submitBuild(job, answers, authData, (err, queueUrl) => {
      if (err) throw err

      // TODO(evanlucas) Try to use the queueUrl to determine
      // the build id. If it returns a 404, then the build has
      // already been started, so we can just fetch the lastBuild
      if (job === 'node-test-pull-request') {
        setTimeout(() => {
          fetch('lastBuild', authData)
        }, 5000)
      } else {
        console.log('Successfully submitted build', parsed.job)
      }
    })
  })
}
