workflow "Build and Test" {
  on = "push"
  resolves = ["Run Tests", "Run Linting"]
}

action "Install Dependencies" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "Run Tests" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install Dependencies"]
  args = "test"
  env = {
    CI = "true"
  }
}

action "Run Linting" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install Dependencies"]
  args = "lint"
}