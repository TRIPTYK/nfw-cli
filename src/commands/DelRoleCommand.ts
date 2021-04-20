import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { deleteRole, getRoles, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelRoleCommand extends BaseCommand {
	public command = "del-role";
	public aliases = ["delro"];
	public describe = "Deletes roles";

	async handler(argv: any) {
		const roles = await getRoles();
		roles.push("--Cancel--");
		await inquirer
			.prompt([
				{
					name: "deleteRole",
					type: "list",
					message: "What role do you want to remove",
					choices: roles,
				},
			])
			.then(async (answer) => {
				if (answer.deleteRole !== "--Cancel--") {
					log.loading("Deleting a role in progress");
					await deleteRole(answer.deleteRole);
					await save();
					log.success(`Role ${answer.deleteRole} was successfully deleted`);
				}
			});
	}
}
