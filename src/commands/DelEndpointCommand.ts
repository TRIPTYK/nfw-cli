import { deleteEndpoint, deleteEndpointByUri, save } from "@triptyk/nfw-core";
import { join } from "path";
import { Logger as Log } from "../utils";
import { BaseCommand } from "./template";

export class DelEndpointCommand extends BaseCommand {
	public command: string | string[] = "del-endpoint <prefix> <subroute> <requestMethod>";
	public aliases = ["delend"];
	public describe = "Delete an endpoint of a specific route.";

	public async handler(argv: any) {
		Log.loading("Deleting an endpoint in progress");
		await deleteEndpointByUri(argv.prefix, argv.subroute, argv.requestMethod);
		await save();
		Log.success(`Endpoint ${join(argv.prefix, argv.subroute)} (${argv.requestMethod.toUpperCase()}) deleted !`);
	}
}
