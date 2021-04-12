import { BaseCommand } from "./template";
import { removeColumn, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class DelColumnCommand extends BaseCommand {
	public command = "del-column <entity> <columnName>";
	public aliases = ["delcol"];
	public describe = "Remove a column in the target entity";

	async handler(argv: any) {
		log.loading("Deleting a column in progress");
		await removeColumn(argv.entity, argv.columnName);
		await save();
		log.success("Column successfully removed");
	}
}
