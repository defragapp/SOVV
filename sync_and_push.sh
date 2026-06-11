#!/bin/bash
git fetch origin main
git merge origin/main -m "chore: sync remote"
env GIT_ASKPASS=/bin/echo git push origin main
