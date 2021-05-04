import { expect } from "chai";
import { execInProject as exec , testInput } from "./global";

describe("GenerateEntityCommand", function() {
	this.timeout("20s");
	let command = null;

	it("Generates a JSON:API entity.", () => {
		command = exec(`nfw generate-entity ${testInput}`);

		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain(`Entity successfully created`);
	});

	// TODO: prevent json api overriding
	// it("Tries to generate an already existing JSON:API entity.", () => {
	// 	command = exec(`nfw generate-route ${testInput}`);

	// 	expect(command).to.exit.with.code(1)
	// 	.and.stdout.contain("This route already exists.");
	// });
});