'use strict'

const request = require('request')
const utils = require('./utils')
// { job: 'node-test-pull-request'
// , params: {
//     TARGET_GITHUB_ORG: 'nodejs'
//   , TARGET_REPO_NAME: 'node'
//   , PR_ID: 1234
//   , POST_STATUS_TO_PR: true
//   , REBASE_ONTO: '<pr base branch>'
//   }
// , creds: {
//     user: 'evanlucas'
//   , token: 'blah'
//   }
// }
module.exports = function submitBuild(job, params, creds, cb) {
  if (!job || typeof job !== 'string')
    throw new TypeError('job must be a string')

  if (!params || typeof params !== 'object')
    throw new TypeError('params must be an object')

  if (!creds || typeof creds !== 'object')
    throw new TypeError('creds must be an object')

  const uri = `${utils.ciURL}/job/${job}/buildWithParameters`
  const opts = {
    uri: uri
  , form: params
  , auth: {
      username: creds.user
    , password: creds.token
    }
  }

  request.post(opts, (err, res, body) => {
    if (err) return cb(err)
    console.log(require('util').inspect(res.headers, null, {
      colors: true
    , depth: null
    }))

    const code = res.statusCode
    if (code !== 201) {
      const er = new Error(`Received non-201 status code: ${code}`)
      er.body = body
      return cb(er)
    }

    cb(null, res.headers.location)
  })
}
