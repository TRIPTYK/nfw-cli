import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { getRoles, removePerms, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelPermsCommand extends BaseCommand {
	public command = "del-perms <entity> <methodName>";
	public aliases = ["delper"];
	public desc = "Remove permissions for any route of any entity";

	async handler(argv: any) {
		const roles = await getRoles();
		roles.push("--Cancel--");
		inquirer
			.prompt([
				{
					name: "delPerm",
					type: "list",
					message: `What role do you want to remove to ${argv.route}`,
					choices: roles,
				},
			])
			.then((answer) => {
				if (answer.deleteRole !== "--Cancel--") {
					const entity = {
						entity: argv.entity,
						methodName: argv.methodName,
						role: answer.delPerm,
					};
					removePerms(entity).catch((error) => {
						log.error("Error : " + error.message);
					});
					save();
					log.success("Permission successfully removed");
				}
			});
	}
}
