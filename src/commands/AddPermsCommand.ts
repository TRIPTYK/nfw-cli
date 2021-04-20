import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { getRoles, addPerms, save, getRoutes } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";
import * as Chalk from "chalk";
import * as pluralize from "pluralize";

export class AddPermsCommand extends BaseCommand {
	public command = "add-perms";
	public aliases = ["adper"];
	public describe = "Adds permissions for any route of any entity";

	async handler(argv: any) {
		const roles = await getRoles();
		const routes = await getRoutes();

		console.log(
			routes.map((r) => {
				return r.prefix;
			})
		);

		roles.push("--Cancel--");
		await inquirer
			.prompt([
				{
					name: "entity",
					type: "list",
					message: `On which entity do you want to add a permission`,
					choices: routes.map((r) => {
						return r.prefix;
					}),
					loop: false,
				},
			])
			.then(async (answer) => {
				const entityRoute = routes.filter((r) => {
					if (r.prefix === answer.entity) {
						return r;
					}
					return null;
				});

				await inquirer
					.prompt([
						{
							name: "method",
							type: "list",
							message: `On which method from ${Chalk.blue.bold(
								answer.entity
							)} do you want to add a permission`,
							choices: entityRoute[0].routes.map((m) => {
								return m.methodName;
							}),
							loop: false,
						},
						{
							name: "perm",
							type: "list",
							message: `What role do you want to add to ${Chalk.blue.bold(
								answer.entity
							)}`,
							choices: roles,
							loop: false,
						},
					])
					.then(async (answer2) => {
						const targetedRoute = entityRoute[0].routes.filter((m) => {
							if (m.methodName === answer2.method) {
								return m.methodName;
							}
							return null;
						});
						if (answer2.perm !== "--Cancel--") {
							const entity = {
								entity: pluralize.singular(answer.entity),
								methodName: answer2.method,
								requestMethod: targetedRoute[0].requestMethod,
								path: targetedRoute[0].path,
								role: answer2.perm,
							};

							log.loading("Adding a perms in progress");
							await addPerms(entity);
							await save();
							log.success("Permission successfully added");
						} else {
							log.error("Cancelled");
						}
					});
			});
	}
}
