import { expect } from "chai";
import { execInProject, testInput } from "./global";

describe("AddRoleCommand", function () {
	this.timeout("3600s");
	let command = null;

	it("Adds a valid role", async () => {
		command = execInProject(`nfw add-role ${testInput}`);
		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain("Role successfully added");
	});

	it("Tries to add an existing role", async () => {
		command = execInProject(`nfw add-role ${testInput}`);
		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain(`${testInput} already exist`);
	});
	
	it("Tries to add an invalid role", async () => {

		const faultyValue = "123=t=gfg=gzeg";

		command = execInProject(`nfw add-role ${faultyValue}`);
		
		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain("Insert a valid role name");
	});
});
