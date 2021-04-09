import { BaseCommand } from "./template";
import { addRelation, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";
import * as inquirer from "inquirer";

export class AddRelationCommand extends BaseCommand {
	public command =
		"add-relation <entity> <target> <name> <inverseName> <isNullable>";
	public aliases = ["adrel"];
	public describe = "Add relation between entity";

	async handler(argv: any) {
		const relations = ["one-to-one", "one-to-many", "many-to-many"];
		relations.push("--Cancel--");
		await inquirer
			.prompt([
				{
					name: "addRelation",
					type: "list",
					message: "What type of relationship do you want to add ?",
					choices: relations,
				},
			])
			.then(async (answer) => {
				if (answer.deleteRole !== "--Cancel--") {
					const params = {
						target: argv.target,
						type: answer.addRelation,
						name: argv.name,
						inverseRelationName: argv.inverseName,
						isNullable: argv.isNullable,
					};
					await addRelation(argv.entity, params);
					await save();
					log.success("Relation successfully added");
				}
			});
	}
}
