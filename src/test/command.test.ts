import { CommandsRegistry } from "../application";
import { getRoles } from "@triptyk/nfw-core";
import { assert } from "chai";

describe("Commands", () => {
	before(async () => {
		const roles = ["Admin", "User", "Ghost"];
	});

	it("Add Role command", async () => {
		// const argv = { roleName: "lapin" };
		// await CommandsRegistry.all.AddRoleCommand.handler(argv);

		const answer = { deleteRole: "lapin" };
		await CommandsRegistry.all.DelRoleCommand.handler(answer);
		// console.log(CommandsRegistry.all);
	});
});
