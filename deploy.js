const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const childProcess = require("child_process")
const config = require("./config.json")

app.use(bodyParser.json()) // for parsing application/json

app.post("/webhooks/gitlab", (req, res) => {
	if (req.get("X-Gitlab-Token") !== config.secret) return res.sendStatus(401)

	if (req.body.event_name !== "push") return res.sendStatus(406)
	let branch = req.body.ref

	if (branch == "refs/heads/master") {
		deploy(res)
	} else {
		res.sendStatus(200)
	}
})

function deploy(res) {
	console.log("[LOG] Starting Deployment")
	childProcess.exec(`cd ${config.deployerDir} && bash ./deploy.sh`, function(
		err,
		stdout,
		stderr
	) {
		console.log(stdout)
		if (err) {
			console.error(err)
			return res.sendStatus(500)
		}
		res.sendStatus(200)
	})
}

app.listen(config.port || 3000, () =>
	console.log(`Git Auto Deployer listening on port ${config.port || 3000}!`)
)
