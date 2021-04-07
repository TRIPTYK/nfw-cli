import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { deleteRole, getRoles, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelRoleCommand extends BaseCommand {
	public command = "delete-role";
	public aliases = ["delro"];
	public describe = "Delete roles";

	async handler(argv: any) {
		const roles = await getRoles();
		roles.push("--Cancel--");
		inquirer
			.prompt([
				{
					name: "deleteRole",
					type: "list",
					message: "What role do you want to remove",
					choices: roles,
				},
			])
			.then((answer) => {
				if (answer.deleteRole !== "--Cancel--") {
					deleteRole(answer.deleteRole)
						.then(() => {
							save();
							log.success(`Role ${answer.deleteRole} was successfully deleted`);
						})
						.catch((error) => {
							log.error("Error : " + error.message);
						});
				}
			});
	}
}
