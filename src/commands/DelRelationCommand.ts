import { BaseCommand } from "./template";
import { removeRelation, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelRelationCommand extends BaseCommand {
	public command = "del-relation <entity> <relationName>";
	public aliases = ["delrel"];
	public describe = "Removes relation between entity";

	async handler(argv: any) {
		log.loading("Deleting a relation in progress");
		await removeRelation(argv.entity, argv.relationName);
		await save();
		log.success("Relation successfully removed");
	}
}
