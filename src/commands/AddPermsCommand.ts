import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { getRoles, addPerms, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class AddPermsCommand extends BaseCommand {
	public command = "add-perms <entity> <methodName> <requestMethod>";
	public aliases = ["adper"];
	public describe = "Add permissions for any route of any entity";

	async handler(argv: any) {
		const roles = await getRoles();
		roles.push("--Cancel--");
		await inquirer
			.prompt([
				{
					name: "addPerm",
					type: "list",
					message: `What role do you want to add to ${argv.route}`,
					choices: roles,
				},
			])
			.then(async (answer) => {
				if (answer.deleteRole !== "--Cancel--") {
					const entity = {
						entity: argv.entity,
						methodName: argv.methodName,
						requestMethod: argv.requestMethod,
						path: "/" + argv.methodName,
						role: answer.addPerm,
					};

					await addPerms(entity);
					await save();
					log.success("Permission successfully added");
				}
			});
	}
}
