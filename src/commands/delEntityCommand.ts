import { BaseCommand } from "./template";
import { deleteJsonApiEntity, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelEntity extends BaseCommand {
	public command = "del-entity <entityName>";
	public aliases = ["delentity"];
	public describe = "Delete an entity";

	async handler(argv: any) {
		await deleteJsonApiEntity(argv.entityName);
		await save();
		log.success("Entity successfully deleted");
	}
}
