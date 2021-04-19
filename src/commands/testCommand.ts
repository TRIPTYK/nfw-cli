import { BaseCommand } from "./template";
import { getRoutes } from "@triptyk/nfw-core";

/**
 * Test
 */
export class Test extends BaseCommand {
	public command = "test";
	public aliases = ["t"];
	public describe = "Add a column in the target entity";

	async handler(argv: any) {
		getRoutes();
	}
}
