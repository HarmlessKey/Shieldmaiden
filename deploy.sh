#!/bin/bash

NC="\033[0m"
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"

USER="harm"
REMOTE_IP="37.97.150.110"
REMOTE_PATH="/var/www/harmlesskey.com/public_html"
LOCAL_PATH="dist/*"
BRANCH="master"

printf "\n${GREEN}> STARTING DEPLOYMENT${NC}\n"
printf "> Checking out master\n\n"
git checkout ${BRANCH}
if [ $? -ne 0 ]; then
	printf "\n${RED}>> git checkout ${BRANCH} failed${NC}\n"
	exit 1
fi
printf "> Building for production\n"
npm run build
if [ $? -ne 0 ]; then
	printf "\n${RED}>> npm run build failed${NC}\n"
	exit 1
fi

printf "> Committing to git\n"
git commit -am "DEPLOY AUTO COMMIT"
printf "> Pushing to ${BRANCH}\n"
git push

printf "\n${YELLOW}> DEPLOYING TO ${REMOTE_IP}${NC}\n"
scp -r ${LOCAL_PATH} ${USER}@${REMOTE_IP}:${REMOTE_PATH}
if [ $? -ne 0 ]; then
	printf "\n${RED}>> DEPLOY TO SERVER FAILED!${NC}\n"
	exit 1
fi
printf "\n${GREEN}> DEPLOY TO SERVER${NC}\n"
