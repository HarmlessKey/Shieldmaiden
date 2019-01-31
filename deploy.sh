#!/bin/bash

NC="\033[0m"
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"

REMOTE_IP="37.97.150.110"
REMOTE_PATH="/var/www/harmlesskey.com/public_html"
BRANCH="master"

printf "\n${GREEN}Starting deployment\n"
printf "${NC}Checking out master\n"
git checkout master
if [ $? -ne 0 ]; then
	printf "\n${RED}git checkout master failed\n"
	exit 1
fi
npm run build
if [ $? -ne 0 ]; then
	printf "\n${RED}npm run build failed\n"
	exit 1
fi

git commit -am "DEPLOY AUTO COMMIT"
git push

printf "\n${GREEN}DEPLOYED TO SERVER\n"
# scp -r dist/* harm@37.97.150.110:/var/www/harmlesskey.com/public_html
