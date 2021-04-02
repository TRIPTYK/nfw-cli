import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import * as nfw from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

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
				nfw
					.addRole(answer.addRole)
					.then(() => {
						nfw.save();
						log.success("Role successfully added");
					})
					.catch((error) => {
						log.error("Error : " + error.message);
					});
			});
	}
}
