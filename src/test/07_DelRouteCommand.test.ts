import { expect } from "chai";
import { execInProject as exec, testInput } from "./global";

describe("DelRouteCommand", function() {
	this.timeout("20s");
	let command = null;

	const route = testInput;

	it("Deletes a controller.", () => {
		command = exec(`nfw del-route ${route}`);

		expect(command).to.exit.with.code(0)
		.and.stdout.to.contain(`Route /${route} deleted !`);
	});

	it("Tries to delete an inexisting controller.", () => {
		command = exec(`nfw del-route ${route}`);

		expect(command).to.exit.with.code(1)
		.and.stdout.contain(`Prefix "${route}" doesn't exist.`);
	});
});