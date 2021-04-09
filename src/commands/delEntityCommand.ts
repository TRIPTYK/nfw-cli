import { BaseCommand } from "./template";
import { deleteJsonApiEntity, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelEntity extends BaseCommand {
	public command = "del-entity <name>";
	public aliases = ["delentity"];
	public describe = "Delete an entity";

	async handler(argv: any) {
		await deleteJsonApiEntity(argv.name);
		await save();
		log.success("Entity successfully deleted");
	}
}
