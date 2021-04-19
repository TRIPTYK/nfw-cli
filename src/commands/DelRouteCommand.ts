import { deleteBasicRoute, getRoutes, save } from "@triptyk/nfw-core";
import { Logger as Log } from "../utils";
import { BaseCommand } from "./template";

export class DelRouteCommand extends BaseCommand {
	public command: string | string[] = "delete-route <prefix>";
	public aliases = ["delroute"];
	public describe = "Delete a basic route.";

	public async handler(argv: any) {
		Log.loading("Deleting a route in progress");
		await deleteBasicRoute(argv.prefix);
		await save();
		Log.success(`Route /${argv.prefix} deleted !`);
	}
}
