import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { deleteRole, getRoles, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelRoleCommand extends BaseCommand {
	public command = "del-role [role]";
	public aliases = ["delro"];
	public describe = "Deletes roles";

	async handler(argv: any) {
		if(!argv.role) {
			const roles = await getRoles();
			roles.push("--Cancel--");
			const answer = await inquirer
				.prompt([
					{
						name: "deleteRole",
						type: "list",
						message: "What role do you want to remove",
						choices: roles,
					},
				]);
			if (answer.deleteRole === "--Cancel--") return;
			argv.role = answer.deleteRole;
		}
		log.loading("Deleting a role in progress");
		await deleteRole(argv.role);
		await save();
		log.success(`Role ${argv.role} was successfully deleted`);
	}
}
