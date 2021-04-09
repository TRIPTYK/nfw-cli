import { BaseCommand } from "./template";
import { addRole, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

export class AddRoleCommand extends BaseCommand {
	public command = "add-role <roleName>";
	public aliases = ["adro"];
	public describe = "Add roles for permissions";

	async handler(argv: any) {
		const regex = /^[a-zA-Z_$][0-9a-zA-Z_$]{1,}$/;
		if (!regex.test(argv.roleName)) throw "Insert a valid role name";

		await addRole(argv.roleName);
		await save();
		log.success("Role successfully added");
	}
}
