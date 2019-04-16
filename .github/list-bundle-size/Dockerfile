FROM debian:9.5-slim

LABEL "com.github.actions.name"="List Bundle Size"
LABEL "com.github.actions.description"="List size of files in directory"
LABEL "com.github.actions.icon"="mic"
LABEL "com.github.actions.color"="purple"

LABEL "repository"="http://github.com/octocat/hello-world"
LABEL "homepage"="http://github.com/actions"
LABEL "maintainer"="Alex LaFroscia <alex@lafroscia.com>"

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]