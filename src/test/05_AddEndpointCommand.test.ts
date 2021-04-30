import { expect } from "chai";
import { join } from "path";
import { execInProject as exec , testInput } from "./global"

describe("AddEndpointCommand", function() {
	this.timeout("10s");

	let command = null;

	const method = "PUT";

	it("Adds an endpoint", () => {
		command = exec(`nfw add-endpoint ${testInput} ${testInput} ${method}`);

		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain(`Endpoint ${method} on /${join(testInput, testInput)} created !`);
	});

	it("Tries to add an already existing endpoint", () => {
		command = exec(`nfw add-endpoint ${testInput} ${testInput} ${method}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain(`This method already exists.`);
	});

	it("Tries to add an endpoint but with an non-valid method", () => {

		const faultyValue = "BANANA";

		command = exec(`nfw add-endpoint ${testInput} ${testInput} ${faultyValue}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain(`${faultyValue} doesn't exist or isn't compatible yet.`);
	});
});