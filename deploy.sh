cd ~/var/node/com.vivatrucks.discord

echo "--- Pulling from Master ---" 

git pull origin master

echo "--- Pulled successfully from master ---"

echo "--- Restarting server ---"

pm2 restart Discord

echo "--- Server restarted Successfully ---"

echo "--- Deployment successful ---"