import { expect } from "chai";
import { promisifiedExec as exec } from "../utils";
import { execInProject, testInput } from "./global";

describe("AddRoleCommand", function () {
	this.timeout("3600s");
	let command = null;

	it("Add a valid role", async () => {
		command = execInProject(`nfw add-role ${testInput}`);
		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain("Role successfully added");
	});
	
	it("Add an invalid role", async () => {

		const faultyValue = "123=t=gfg=gzeg";

		command = execInProject(`nfw add-role ${faultyValue}`);
		
		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain("Insert a valid role name");
	});
});
