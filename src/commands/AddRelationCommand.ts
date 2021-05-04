import { BaseCommand } from "./template";
import { addRelation, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";
import * as inquirer from "inquirer";

export class AddRelationCommand extends BaseCommand {
	public command =
		"add-relation <entity> <target> <name> <inverseName> <isNullable> [relation]";
	public aliases = ["adrel"];
	public describe = "Adds relation between entity";

	async handler(argv: any) {
		const relations = ["one-to-one", "one-to-many", "many-to-many"];
		relations.push("--Cancel--");
		
		if(!argv.relation) {
			const { type } = await inquirer
			.prompt([
				{
					name: "type",
					type: "list",
					message: "What type of relationship do you want to add ?",
					choices: relations,
				},
			]);
			argv.relation = type;
		}

		if(!relations.includes(argv.relation))
			throw new Error(`Bad relation, please enter one of these relations: ${relations}.`);

		if (argv.relation === "--Cancel--") return;

		const params = {
			target: argv.target,
			type: argv.relation,
			name: argv.name,
			inverseRelationName: argv.inverseName,
			isNullable: argv.isNullable,
		};
		log.loading("Adding a relation in progress");
		await addRelation(argv.entity, params);
		await save();
		log.success("Relation successfully added");
	}
}
