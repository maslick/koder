# Contributing

Whether it's a new feature, correction, or additional documentation, we welcome your pull requests. Please submit any [issues](https://github.com/maslick/koder/issues) or [pull requests](https://github.com/maslick/koder/pulls) through GitHub.

This document contains guidelines for reporting issues or pull requests and contributing code.

## Reporting Issues

- Check to see if there\'s an existing issue/pull request for the bug/feature. All issues are at <https://github.com/maslick/koder/issues> and pull reqs are at <https://github.com/maslick/koder/pulls>.
- If there isn't an existing issue there, please file an issue. If possible, use one of the suggested issue types when creating a new issue (like a bug report or a feature request). These issue types have their own template and required information. In general, the ideal report includes:
  - A description of the problem/suggestion.
  - The specific console commands you are running. Please include debug logs for these commands. Be sure to remove any sensitive information from the debug logs.
 
The first thing a developer will do is try to reproduce the issue you are seeing, so try to reduce your issue to the smallest possible set of steps that demonstrate the issue. This will lead to quicker resolution of your issue.

## Git Commits and Workflow

When sending a pull request, please follow these guidelines:

- The PR should target the `master` branch.
- Your PR branch should be based off a recent commit of the `master` branch. Preferably the base commit for the PR should use the latest commit of `master` at the time the PR was created. This helps to ensure there are no merge conflicts or test failures when the PR is merged back to the `master` branch.
- Make separate commits for logically separate changes. Avoid commits such as \"update\", \"fix typo again\", \"more updates\". Rebase your commits before submitting your PR to ensure they represent a logical change.

### Example Git Workflow

Below is an example of how you can use git to create a feature branch. First, make sure you've created a fork of `maslikc/koder`. Then you can run these commands:

```bash
# Clone the repo and set up the remotes:
$ git clone git@github.com:myusername/koder.git
$ cd koder
$ git remote add upstream https://github.com/maslick/koder.git
$ git fetch upstream
$ git merge upstream/master

# Now to create a feature branch:
$ git checkout -b my-branch-name

# Now add your commits for your features:
$ git add path/to/my/files
$ git commit -m "Add support for foo"

# If we want to sync with the latest upstream changes before
# sending our pull request we can run:
$ git fetch upstream
$ git rebase upstream/master

 # When you're ready to send a PR, make sure you push your commits
 # to your fork:
 $ git push origin my-branch-name

When you push to your remote, the output will contain a URL you can use to open a pull request.
```

After you create a PR or push to a PR, a CI job will be triggered. This job will build:
* WASM files
* React static web app

A request will be sent to core maintainers to review your code and approve a deploy to a dev environment. Once deployed, you can check the resulting web-app at https://koder-dev.web.app

After the PR is merged to `master` branch, the React web-app is deployed to the prodcution environment, which is accessible at https://koder-prod.web.app



