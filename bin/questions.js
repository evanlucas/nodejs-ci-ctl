'use strict'

const nodeTestPRRebaseList = [
  '<pr base branch>'
, 'master'
, 'next'
, 'next+1'
, 'v4.x'
, 'v3.x'
, 'v0.12'
, 'v0.10'
, '<no rebasing>'
]

const nodesSubset = [
  'io.js'
, '0.12'
, '0.10'
, 'pure_docs_change'
, 'all_nodes'
]

const citgmLogLevels = [
  'verbose'
, 'silly'
, 'warn'
, 'error'
]

exports.submit = {
  'node-test-pull-request': [
    { type: 'input'
    , name: 'TARGET_GITHUB_ORG'
    , message: 'GitHub Org'
    , default: 'nodejs'
    }
  , { type: 'input'
    , name: 'TARGET_REPO_NAME'
    , message: 'GitHub Repo Name'
    , default: 'node'
    }
  , { type: 'input'
    , name: 'PR_ID'
    , message: 'PR ID'
    , filter: (input) => {
        return +input
      }
    , validate: (input) => {
        if (!input)
          return 'Please enter a valid Pull Request ID'

        input = +input

        if (input !== input)
          return 'Please enter a valid Pull Request ID'

        return true
      }
    }
  , { type: 'confirm'
    , name: 'POST_STATUS_TO_PR'
    , message: 'Submit build status to GitHub'
    , default: true
    }
  , { type: 'list'
    , name: 'REBASE_ONTO'
    , message: 'Branch on which to rebase'
    , choices: nodeTestPRRebaseList
    }
  , { type: 'confirm'
    , name: 'CERTIFY_SAFE'
    , message: 'Is this safe?'
    , default: false
    }
  ]
, citgm: [
    { type: 'input'
    , name: 'GITHUB_ORG'
    , message: 'GitHub Org'
    , default: 'nodejs'
    }
  , { type: 'input'
    , name: 'REPO_NAME'
    , message: 'GitHub Repo Name'
    , default: 'node'
    }
  , { type: 'input'
    , name: 'GIT_REMOTE_REF'
    , message: 'Remote Ref'
    , default: 'refs/heads/master'
    }
  , { type: 'input'
    , name: 'REBASE_ONTO'
    , message: 'Rebase onto the given ref before testing'
    , default: ''
    }
  , { type: 'input'
    , name: 'POST_REBASE_SHA1_CHECK'
    , message: 'After rebasing, check that the resulting commit sha1 matches'
    , default: ''
    }
  , { type: 'list'
    , name: 'NODES_SUBSET'
    , message: 'The subset of nodes to run tests on'
    , choices: nodesSubset
    }
  , { type: 'list'
    , name: 'GIT_ORIGIN_SCHEME'
    , message: 'Git Origin Scheme'
    , choices: ['https://github.com/', 'git@github.com:']
    }
  , { type: 'list'
    , name: 'CITGM_LOGLEVEL'
    , message: 'Log level'
    , choices: citgmLogLevels
    }
  , { type: 'input'
    , name: 'CITGM'
    , message: 'what citgm should npm install'
    , default: 'citgm'
    }
  , { type: 'input'
    , name: 'CITGM_COMMAND'
    , message: 'Command to be executed if you want to test a specific module'
    , default: 'citgm-all'
    }
  ]
}
