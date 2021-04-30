import { expect } from "chai";
import { promisifiedExec as exec } from "../utils";
import * as global from "./global"

// Please note: to run these tests, you must 
// have your docker deamon turned on.

describe("CreateDockerCommand", function() {
	this.timeout("3600s");

	let command = null;
	const container = "test";

	afterEach(async () => {
		await global.cleanDocker(container);
	});

	it("Creates a container", async () => {
		command = await exec(`nfw docker ${container}`);

		expect(command).to.contain(`Container "${container}" created with success`);
		expect(command).to.contain(`Your container "${container}" is now running and listening to port 3306.`);
	});

	it("Creates a personnalized container", async () => {
		const port = 3307;
		const user = "Boby";
		const password = "secret";

		command = await exec(`nfw docker ${container} --port=${port} --user=${user} --password=${password} --nativePassword`);

		expect(command).to.contain(`Container "${container}" created with success`);
		expect(command).to.contain(`Your container "${container}" is now running and listening to port ${port}.`);
	});

	it("Creates a container without running it", async () => {
		command = await exec(`nfw docker ${container} --noRun`);

		expect(command).to.contain(`Container "${container}" created with success`);
		expect(command).to.not.contain(`Your container "${container}" is now running and listening to port 3306.`);
	});
});