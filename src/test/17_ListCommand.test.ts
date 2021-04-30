import { expect } from "chai";
import { execInProject as exec } from "./global"

describe("ListCommand", function() {

	this.timeout("10s");

	let command = null;
	const kind = "routes";

	it("Lists a bunch of things", () => {
		command = exec(`nfw ls ${kind}`);

		expect(command).to.exit.with.code(0)
		.and.stdout.not.empty;
	});

	it("Tries to list a non-existing kind", () => {

		const faultyValue = "bananas";

		command = exec(`nfw ls ${faultyValue}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.to.contain("Unvalid kind.");
	});
});