import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { getRoles, addPerms, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class AddPermsCommand extends BaseCommand {
	public command = "add-perms <entity> <route> <requestMethod>";
	public aliases = ["adper"];

	async handler(argv: any) {
		const roles = await getRoles();
		roles.push("--Cancel--");
		inquirer
			.prompt([
				{
					name: "addPerm",
					type: "list",
					message: `What role do you want to add to ${argv.route}`,
					choices: roles,
				},
			])
			.then((answer) => {
				if (answer.deleteRole !== "Cancel") {
					const entity = {
						entity: argv.entity,
						methodName: argv.route.split("/")[1],
						requestMethod: argv.requestMethod,
						path: argv.route,
						role: answer.addPerm,
					};
					addPerms(entity);
					save();
				}
			});
	}
}
