cd ~/var/node/com.vivatrucks.discord

echo "----------------------------------------------------"
echo "                 Gitlab Auto Deployer               "
echo "               Created By Jack Douglas              "
echo "----------------------------------------------------"
echo ""
echo "---------------- Pulling from Master ---------------" 

git pull origin master

echo "--------- Pulled successfully from master ----------"
echo ""
echo "---------------- Restarting server -----------------"

pm2 restart Discord

echo "---------- Server restarted Successfully -----------"
echo ""
echo "----------------------------------------------------"
echo "               Auto deploy complete                 "
echo "----------------------------------------------------"