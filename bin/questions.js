'use strict'

const submitBranchList = [
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

exports.submit = [
  { type: 'input'
  , name: 'job'
  , message: 'Job Name'
  , default: 'node-test-pull-request'
  , validate: (input) => {
      input = (input || '').trim()

      if (!input)
        return 'Please use a valid job name'

      return true
    }
  }
, { type: 'input'
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
  , choices: submitBranchList
  }
]
