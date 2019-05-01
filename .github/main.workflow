workflow "Test on PR" {
  on = "push"
  resolves = ["GitHub Action for npm-1"]
}

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
