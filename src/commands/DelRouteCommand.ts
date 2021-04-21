import { deleteBasicRoute, getRoutes, save } from "@triptyk/nfw-core";
import * as inquirer from "inquirer";
import { Logger as Log } from "../utils";
import { BaseCommand } from "./template";

export class DelRouteCommand extends BaseCommand {
	public command: string | string[] = "delete-route [prefix]";
	public aliases = ["delroute"];
	public describe = "Deletes a generated route.";

	public async handler(argv: any) {
		let prefix = argv.prefix;
		
		if(!prefix) {
			const choices = (await getRoutes())
				.filter(v=>v.type === "generated")
				.map(v=>v.prefix);

			if(!choices.length) {
				Log.warning("There's no generated route to delete.");
				return;
			}
	
			prefix = await inquirer
				.prompt([
					{
						name: "deleteRoute",
						type: "list",
						message: "What route do you want to remove",
						choices: choices
					},
				])
				.then(async answer => answer.deleteRoute);
			if (prefix === "--Cancel--")
				return;
		}

		Log.loading("Deleting a route in progress");
		await deleteBasicRoute(prefix);
		await save();
		Log.success(`Route /${prefix} deleted !`);
	}
}
