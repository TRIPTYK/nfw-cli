import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { addRole, save } from "@triptyk/nfw-core";

export class AddRoleCommand extends BaseCommand {
	public command = "add-role";
	public aliases = ["adro"];

	async handler(argv: any) {
		inquirer
			.prompt([
				{
					name: "addRole",
					type: "input",
					message: "Choose a name for the role : ",
				},
			])
			.then((answer) => {
				addRole(answer.addRole);
				save();
			});
	}
}
