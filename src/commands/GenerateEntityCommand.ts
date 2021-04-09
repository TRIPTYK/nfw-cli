import { BaseCommand } from "./template";
import { generateJsonApiEntity, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class GenerateEntityCommand extends BaseCommand {
	public command = "generate-entity <name>";
	public aliases = ["genentity"];
	public describe = "Generate an entity";

	async handler(argv: any) {
		await generateJsonApiEntity(argv.name).catch((e) => {
			console.log(e);
		});
		await save();
		log.success("Entity successfully created");
	}
}
