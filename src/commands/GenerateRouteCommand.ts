import { generateBasicRoute, httpRequestMethods, save } from "@triptyk/nfw-core";
import { Logger as Log, methodList } from "../utils";
import { BaseCommand } from "./template";

export class GenerateRouteCommand extends BaseCommand {
	public command: string | string[] = "generate-route <prefix> [methods..]";
	public aliases = ["genroute"];
	public describe = "Generates a basic route.";

	public builder = {
		all: {
			desc: "Generates a route for each of all methods.",
			type: "boolean",
			default: false,
		},
	};

	public async handler(argv: any) {
		if (argv.all) argv.methods = httpRequestMethods;

		if (!argv.methods.length) argv.methods = null;

		Log.loading("Generating a route in progress");
		
		await generateBasicRoute(argv.prefix, argv.methods);
		await save();

		Log.success(`Route /${argv.prefix} created !`);
	}
}
