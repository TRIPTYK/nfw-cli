import { expect } from "chai";
import { promisifiedExec as exec } from "../utils";
import { execInProject, projectName } from "./global";

describe("AddRoleCommand", function () {
	this.timeout("3600s");
	let command = null;

	it("Add a valid role", async () => {
		command = await execInProject(`nfw add-role lapin`);
		expect(command).to.contain("Role successfully added");
	});
	// it("Add an invalid role", async () => {
	// 	command = await exec(`nfw add-role 123Soleil`);
	// 	expect(command).to.contain("Adding a role in progress");
	// 	expect(command).to.contain("Insert a valid role name");
	// });
});
