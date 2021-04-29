import * as global from "./global";
import { promisifiedExec as exec } from "../utils";
import { expect } from "chai";

// Please note: to run these tests, you must 
// have your docker deamon turned on.

describe("InitCommand", function() {
	this.timeout("3600s");
	
	let command = null;

	after(global.cleanDocker);

	it("Creates a project then inits it", async () => {
		command = await exec(`nfw new -f --noInit --yarn ${global.projectName}`);

		expect(command).to.contain("Your project is ready");

		command = await exec(`
			cd ${global.projectName}
			nfw init -dy
		`);

		expect(command).to.contain("Initiation done");
	});

});