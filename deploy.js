const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const childProcess = require("child_process");
const force = require("express-force-domain");
const axios = require("axios");
const config = require("./config.json");

app.use(bodyParser.json({ limit: "50mb" })); // for parsing application/json
if (!config.dev) app.use(force(`http://${config.domain}:${config.port || 3000}`)); // For setting domain

app.post("/webhooks/gitlab", (req, res) => {
	if (req.get("X-Gitlab-Token") !== config.secret) return res.sendStatus(401);

	let projectFound = false;
	let deployError = null;

	// Loop through the projects
	for (let i = 0; i < config.projects.length; i++) {
		// Found a project with same repo name
		if (
			req.body.project.path_with_namespace ==
			`${config.username}/${config.projects[i].repoName}`
		) {
			// Check if the project allows merge requests
			if (req.body.event_name !== "push")
				return res.status(406).send({ error: "Not acceptable event" });

			if (req.body.object_kind === "push") {
				projectFound = true;

				// Push was to the given branch
				if (req.body.ref == `refs/heads/${config.projects[i].branch}`) {
					console.log(
						`Project Found: ${config.projects[i].repoName} on ${
							config.projects[i].branch
						} branch, Starting auto deployment`
					);
					deploy(res, config.projects[i])
						.then(result => {
							discordWebhook(config.projects[i], true);
						})
						.catch(error => {
							discordWebhook(config.projects[i], false);
							deployError = error;
							console.log("[ERROR] ", error);
						});

					if (deployError !== null) return res.status(500).send(deployError);

					return res.status(200).send({
						error: false,
						message: `Successfully deployed ${config.projects[i].repoName}`
					});
				}
				return res.status(406).send({ error: "Not acceptable branch" });
			}
		}
	}
	return res.status(404).send({ error: "Project not found" });
});

app.post("/redeploy", (req, res) => {
	if (req.body.AccessToken !== config.secret) return res.sendStatus(401);

	for (let i = 0; i < config.projects.length; i++) {
		// Found a project with same repo name
		if (req.body.repo == config.projects[i].repoName) {
			console.log(
				`Project Found: ${
					config.projects[i].repoName
				} on master branch, Starting auto deployment`
			);
			deploy(res, config.projects[i]).then(
				result => {
					return res.status(200).send({
						error: false,
						message: `Successfully deployed ${req.body.repo}`,
						out: result
					});
				},
				error => {
					console.log("[ERROR] " + error);
					return res.status(500).send(error);
				}
			);
		}
	}
	return res.status(404).send({
		error: "Project not found",
		data: { repoName: req.body.repo }
	});
});

const deploy = (res, project) => {
	return new Promise(function(resolve, reject) {
		childProcess.exec(
			`cd ${config.deployerDir} && bash ./deployment_scripts/${project.scriptName}`,
			function(err, stdout, stderr) {
				if (err) {
					reject(stderr);
				}
				console.log(stdout);
				resolve(stdout);
			}
		);
	});
};

const discordWebhook = (project, success) => {
	let payload = null;
	if (success) {
		payload = {
			username: "AutoDeployer - Server 01",
			embeds: [
				{
					title: "AutoDeployer Status Update",
					description: `***${project.repoName}*** has been successfully deployed`,
					color: 8311585
				}
			]
		};
	} else {
		payload = {
			username: "AutoDeployer - Server 01",
			embeds: [
				{
					title: "AutoDeployer Status Update",
					description: ` An error occurred whilst trying to deploy ***${
						project.repoName
					}***. Check server console for more info. `,
					color: 13632027
				}
			]
		};
	}

	axios.post(config.webhook, payload).catch(e => {
		console.log(JSON.stringify(e.response.data));
	});
	return;
};

app.listen(config.port || 3000, () =>
	console.log(`Git Auto Deployer listening on port ${config.port || 3000}!`)
);
