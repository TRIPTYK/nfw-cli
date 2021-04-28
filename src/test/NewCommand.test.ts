import { expect } from "chai";
import { promisifiedExec as exec } from "../utils";
import { cleanProject, projectName } from "./global";

// Please note: to run these tests, you must 
// have your docker deamon turned on.

describe("NewCommand", function() {
	this.timeout("3600s");

	let command = null;

	afterEach(cleanProject);
	
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