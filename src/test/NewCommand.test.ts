import { expect } from "chai";
import { promisifiedExec as exec } from "../utils";

// Please note: to run these tests, you must 
// have your docker deamon turned on.

describe("NewCommand", function() {
	this.timeout("3600s");

	const projectName = "test_project";
	let command = null;

	afterEach(clean);
	
	it("Creates a simple project", async () => {
		command = await exec(`nfw new -dysf --yarn ${projectName}`);
		
		expect(command).to.contain("Your project is ready");
	});

	it("Creates a project then inits it", async () => {
		command = await exec(`nfw new -f --noInit --yarn ${projectName}`);

		expect(command).to.contain("Your project is ready");

		command = await exec(`
			cd ${projectName}
			nfw init -dy
		`);

		expect(command).to.contain("Initiation done");
	});

	it("Creates a project but prohibits the MySQL connection", async () => {
		command = await exec(`nfw new -fy --noInitDb --yarn ${projectName}`);

		expect(command).to.contain("Your project is ready");
	});
});

async function clean() {
	try {
		await exec("rm -rf test_project");
		await exec("docker stop nfw && docker rm nfw");
	} catch (error) {}
}