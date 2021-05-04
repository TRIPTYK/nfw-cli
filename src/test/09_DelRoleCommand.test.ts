import { expect } from "chai";
import { capitalize } from "../utils/capitalize";
import { execInProject, testInput } from "./global";

describe("DelRoleCommand", function () {
	this.timeout("3600s");
	let command = null;

	const input = capitalize(testInput);

	it("Deletes a role", async () => {
		command = execInProject(`nfw del-role ${input}`);
		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain(`Role ${input} was successfully deleted`);
	});

	it("Tries to delete a non-existing role", async () => {
		command = execInProject(`nfw del-role ${input}`);
		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain(`Role "${input}" does not exist.`);
	});
});
