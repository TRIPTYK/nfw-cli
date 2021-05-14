import { addEndpoint, save } from "@triptyk/nfw-core";
import { join } from "path";
import { Logger as Log, withoutSpecialChar } from "../utils";
import { BaseCommand } from "./template";

export class AddEndpointCommand extends BaseCommand {
	public command: string | string[] =
		"add-endpoint <prefix> <endpoint> <method>";
	public aliases = ["adend"];
	public describe = "Adds an endpoint to a specific route.";

	public async handler(argv: any) {
		argv.method = argv.method.toUpperCase();
		
		const parts = (argv.endpoint as string)
			.split('/')
			.filter(v=>v!=='');

		for(const part of parts) {
			if(!part.trim().match(withoutSpecialChar))
				throw `"${part}" is not a valid part of subroute.`;
		}

		Log.loading("Adding an endpoint in progress");
		await addEndpoint(argv.prefix, argv.method, argv.endpoint);

		await save();

		Log.success(`Endpoint ${argv.method} on /${join(argv.prefix, argv.endpoint)} created !`);
	}
}
