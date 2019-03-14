workflow "Build and Test" {
  on = "push"
  resolves = ["Run Tests"]
}

action "Install Dependencies" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "Run Tests" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install Dependencies"]
  args = "test"
}
