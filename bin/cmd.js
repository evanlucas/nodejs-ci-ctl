#!/usr/bin/env node

'use strict'

const help = require('help')()
const ghauth = require('ghauth')
const ctl = require('../')
const pkg = require('../package')
const nopt = require('noptd')
const inquirer = require('inquirer')
const questions = require('./questions')

const NodeTestPR = ctl.NodeTestPR
const submitBuild = ctl.submitBuild

const knownOpts = {
  help: Boolean
, version: Boolean
, depth: Number
}

const shortHand = {
  h: ['--help']
, v: ['--version']
, d: ['--depth']
}

const defs = {
  depth: 5
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

  NodeTestPR.print({
    id: id
  , depth: parsed.depth
  , user: authData.user
  , token: authData.token
  })
}

function submit(authData) {
  inquirer.prompt(questions.submit, (answers) => {
    const job = answers.job
    delete answers.job
    submitBuild(job, answers, authData, (err, queueUrl) => {
      if (err) throw err

      if (job === 'node-test-pull-request') {
        setTimeout(() => {
          fetch('lastBuild', authData)
        }, 5000)
      } else {
        console.log('Successfully submitted build')
      }
    })
  })
}
