import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import {
	addRole,
	save,
	getEntityRoutes,
	MetadataController,
} from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class AddPermsCommand extends BaseCommand {
	public command = "add-perms";
	public aliases = ["adper"];

	async handler(argv: any) {
		inquirer
			.prompt([
				{
					name: "addRole",
					type: "input",
					message: "Choose a name for the role : ",
				},
			])
			.then((answer) => {});
	}
}
