# Gitlab/Github webhook Auto Deployer

----
## What is this?
This is a very simple gitlab & github webhook auto deployer

----
## usage
1. Run: `git clone git@gitlab.com:Jackdouglas/deployer.git`
2. Run: `npm i`
3. Rename config.sample.json to config.json
4. Run: `node deploy.js` or use `pm2 start deploy.js`

----
## How to use webhooks
This example will be for gitlab. google it for github

1.  Go-to your project and on the sidebar hover over settings and click integrations
![image](https://images.jackdouglas.info/VOWTpZgg.png)

2. Enter the deployer url, token which you set in your config and enable push events and enter master into the text box
![image](https://images.jackdouglas.info/Ust6fczM.png)

That should be everything working correctly