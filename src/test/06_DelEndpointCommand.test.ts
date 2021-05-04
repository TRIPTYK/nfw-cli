import { expect } from "chai";
import { join } from "path";
import { execInProject as exec, testInput } from "./global"

describe("DelEndpointCommand", function() {
	this.timeout("20s");
	let command = null;

	const method = "PUT";

	it("Deletes an endpoint", () => {

		command = exec(`nfw del-endpoint ${testInput} ${testInput} ${method}`);

		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain(`Endpoint /${join(testInput, testInput)} (${method}) deleted !`);
	});

	it("Tries to delete a non-existing endpoint", () => {

		command = exec(`nfw del-endpoint ${testInput} ${testInput} ${method}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain(`Route "${join(testInput, testInput)}" (${method}) doesn't exist.`);
	});

	it("Tries to delete an endpoint but with an non-valid method", () => {

		const faultyValue = "BANANA";

		command = exec(`nfw del-endpoint ${testInput} ${testInput} ${faultyValue}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain(`${faultyValue} doesn't exist or isn't compatible yet.`);
	});
});