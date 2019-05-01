action "NPM Install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "ci"
}

action "NPM Test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["NPM Install"]
  args = "test"
}

action "Patch Version" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["NPM Test"]
  args = "version patch"
}

action "GitHub Action for npm" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Patch Version"]
  args = "run build"
}

action "GitHub Action for npm-1" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["GitHub Action for npm"]
  args = "publish"
  secrets = ["NPM"]
}

action "NPM-" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "ci"
}

workflow "NPM build, test and ship" {
  on = "push"
  resolves = ["NPM Publish"]
}

action "NPM-Install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "ci"
}

action "NPM-Test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["NPM-Install"]
  args = "test"
}

action "Ship PR" {
  uses = "actions/bin/filter@3c0b4f0e63ea54ea5df2914b4fabf383368cd0da"
  needs = ["NPM-Test"]
  args = "branch master"
}

action "NPM-Patch" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Ship PR"]
  args = "version patch"
  secrets = ["GITHUB_TOKEN"]
}

action "NPM-Build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["NPM-Patch"]
  args = "run build"
}

action "NPM Publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["NPM-Build"]
  args = "publish"
  secrets = ["NPM"]
}
