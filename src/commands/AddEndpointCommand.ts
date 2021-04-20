import { addEndpoint, save } from "@triptyk/nfw-core";
import { Logger as Log, methodList } from "../utils";
import { BaseCommand } from "./template";

export class AddEndpointCommand extends BaseCommand {
	public command: string | string[] =
		"add-endpoint <prefix> <endpoint> <method>";
	public aliases = ["adend"];
	public describe = "Adds an endpoint to a specific route.";

	public async handler(argv: any) {
		argv.method = argv.method.toUpperCase();

		Log.loading("Adding an endpoint in progress");
		await addEndpoint(argv.prefix, argv.method, argv.endpoint);

		await save();

		Log.success(`Endpoint /${argv.prefix}/${argv.endpoint} created !`);
	}
}
