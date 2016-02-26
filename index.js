'use strict'

// Represents the response of a node-test-pull-request
// or a thealphanerd-tap-smoker
exports.BuildResults = require('./lib/build-results')

// Used to submit a new CI run
exports.submitBuild = require('./lib/submit-build')

exports.Build = require('./lib/build')
exports.utils = require('./lib/utils')
