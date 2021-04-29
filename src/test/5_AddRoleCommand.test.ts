import { expect } from "chai";
import { promisifiedExec as exec } from "../utils";
import { goToProject, projectName } from "./global";

describe("AddRoleCommand", function () {
	let command = null;
	before(goToProject);

	it("Add a valid role", async () => {
		command = await exec(`nfw add-role lapin`);
		expect(command).to.contain("Role successfully added");
	});
	it("Add an invalid role", async () => {
		command = await exec(`nfw add-role 123Soleil`);
		expect(command).to.contain("Insert a valid role name");
	});
});
