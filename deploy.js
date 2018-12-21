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

	// Loop through the projects
	for (let i = 0; i < config.projects.length; i++) {
		// Found a proejct with same repo name
		if (req.body.project.name == config.projects[i].repoName) {
			// Push was to the given branch
			if (req.body.ref == "refs/heads/" + config.projects[i].branch) {
				return deploy(res, config.projects[i])
			}
			return res.statusCode(406)
		}
		return res.statusCode(406)
	}
})

function deploy(res, project) {
	childProcess.exec(
		`cd ${config.deployerDir} && bash ./deployment_scripts/${
			project.scriptName
		}`,
		function(err, stdout, stderr) {
			if (err) {
				console.error(err)
				return res.sendStatus(500)
			}
			console.log(stdout)
			res.sendStatus(200)
		}
	)
}

app.listen(config.port || 3000, () =>
	console.log(`Git Auto Deployer listening on port ${config.port || 3000}!`)
)
