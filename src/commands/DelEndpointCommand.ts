import { deleteEndpoint, save } from "@triptyk/nfw-core";
import { Logger as Log } from "../utils";
import { BaseCommand } from "./template";

export class DelEndpointCommand extends BaseCommand {
	public command: string | string[] = "del-endpoint <prefix> <tsmethod>";
	public aliases = ["delend"];
	public describe = "Delete an endpoint of a specific route.";

	public async handler(argv: any) {
		Log.loading("Deleting an endpoint in progress");
		await deleteEndpoint(argv.prefix, argv.tsmethod);
		await save();
		Log.success(`Endpoint /${argv.prefix}/${argv.endpoint} created !`);
	}
}
