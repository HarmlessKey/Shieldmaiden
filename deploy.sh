git checkout master
if [ $? -ne 0 ]; then
	echo "> git checkout master failed"
	exit 1
fi
npm run build
if [ $? -ne 0 ]; then
	echo "> npm run build failed"
	exit 1
fi
git commit -am "DEPLOY AUTO COMMIT"
if [ $? -ne 0 ]; then
	echo "> git commit failed"
	exit 1
fi
git push
if [ $? -ne 0 ]; then
	echo "> git push failed"
	exit 1
fi
echo "DEPLOY TO SERVER"
# scp -r dist/* harm@37.97.150.110:/var/www/harmlesskey.com/public_html
