import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { getRoles, addPerms, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class AddPermsCommand extends BaseCommand {
	public command = "add-perms <entity> <methodName>";
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
					const getArray = [
						"get",
						"list",
						"fetchRelated",
						"fetchRelationships",
					];
					const postArray = ["create", "addRelationships"];
					const patchArray = ["update", "updateRelationships"];
					const deleteArray = ["remove", "removeRelationships"];
					let requestMethod: string;
					if (getArray.includes(argv.methodName)) {
						requestMethod = "get";
					} else if (postArray.includes(argv.methodName)) {
						requestMethod = "post";
					} else if (patchArray.includes(argv.methodName)) {
						requestMethod = "patch";
					} else if (deleteArray.includes(argv.methodName)) {
						requestMethod = "delete";
					} else {
						requestMethod = "get";
					}

					const entity = {
						entity: argv.entity,
						methodName: argv.methodName,
						requestMethod,
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
