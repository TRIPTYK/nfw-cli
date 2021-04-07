import { BaseCommand } from "./template";
import { addRelation, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class AddRelationCommand extends BaseCommand {
	public command =
		"add-relation <entity> <target> <type> <name> <inverseName> <isNullable>";
	public aliases = ["adrel"];
	public describe = "Add relation between entity";

	async handler(argv: any) {
		const params = {
			target: argv.target,
			type: argv.type,
			name: argv.name,
			inverseRelationName: argv.inverseName,
			isNullable: argv.isNullable,
		};
		addRelation(argv.entity, params).catch((error) => {
			log.error("Error : " + error.message);
		});
		save();
		log.success("Relation successfully added");
	}
}
