import { expect } from "chai";
import { exec, testInput } from "./global";

describe("GenerateRouteCommand", function() {
	this.timeout("20s");
	let command = null;

	const route = testInput;

	it("Generates a controller.", () => {
		command = exec(`nfw generate-route ${route} --all`);

		expect(command).stdout.to.contain(`Route /${route} created !`);
	});

	it("Generates an already existing controller.", () => {
		command = exec(`nfw generate-route ${route}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.contain("This route already exists.");
	});
});