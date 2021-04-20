import { BaseCommand } from "./template";
import { generateJsonApiEntity, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class GenerateEntityCommand extends BaseCommand {
	public command = "generate-entity <name>";
	public aliases = ["genentity"];
	public describe = "Generates an entity";

	async handler(argv: any) {
		log.loading("Generating an entity in progress");
		await generateJsonApiEntity(argv.name).catch((e) => {
			console.log(e);
		});
		await save();
		log.success("Entity successfully created");
	}
}
