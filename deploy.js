const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const childProcess = require("child_process")
const force = require("express-force-domain")
const config = require("./config.json")

app.use(bodyParser.json({ limit: "50mb" })) // for parsing application/json
app.use(force(`http://${config.domain}:${config.port || 3000}`)) // For setting domain

app.post("/webhooks/gitlab", (req, res) => {
	if (req.get("X-Gitlab-Token") !== config.secret) return res.sendStatus(401)

	if (req.body.event_name !== "push")
		return res.status(406).send({ error: "Not acceptable event" })

	// Loop through the projects
	for (let i = 0; i < config.projects.length; i++) {
		// Found a project with same repo name
		if (
			req.body.project.path_with_namespace ==
			`${config.username}/${config.projects[i].repoName}`
		) {
			// Push was to the given branch
			if (req.body.ref == "refs/heads/" + config.projects[i].branch) {
				console.log(
					`Project Found: ${
						config.projects[i].repoName
					} on master branch, Starting auto deployment`
				)
				deploy(res, config.projects[i])
				return res.sendStatus(200)
			}
			return res.status(406).send({ error: "Not acceptable branch" })
		}
	}
	return res.status(404).send({ error: "Project not found" })
})

function deploy(res, project) {
	childProcess.exec(
		`cd ${config.deployerDir} && bash ./deployment_scripts/${
			project.scriptName
		}`,
		function(err, stdout, stderr) {
			if (err) {
				console.error(err)
				return res.status(500).send({ error: err })
			}
			console.log(stdout)
			return "success"
		}
	)
}

app.listen(config.port || 3000, () =>
	console.log(`Git Auto Deployer listening on port ${config.port || 3000}!`)
)
