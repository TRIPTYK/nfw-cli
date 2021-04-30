import { BaseCommand } from "./template";
import * as inquirer from "inquirer";
import { getRoles, addPerms, save, getRoutes } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";
import * as Chalk from "chalk";
import * as pluralize from "pluralize";

export class AddPermsCommand extends BaseCommand {
	public command = "add-perms [entity] [method] [role]";
	public aliases = ["adper"];
	public describe = "Adds permissions for any route of any entity";

	async handler(argv: any) {
		const roles = await getRoles();
		const routes = await getRoutes();

		if(!argv.entity) {
			const { entity } = await inquirer
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
			]);

			argv.entity = entity;
		}

		const entityRoute = routes.find((r) => r.prefix === argv.entity);

		if(!entityRoute)
			throw new Error(`${argv.entity} does not exist or does not have any method.`);

		if(!argv.method) {
			const { method } = await inquirer
				.prompt([
					{
						name: "method",
						type: "list",
						message: `On which method from ${Chalk.blue.bold(
							argv.entity
						)} do you want to add a permission`,
						choices: entityRoute.routes.map(m => m.methodName),
						loop: false,
					},
				]);
			argv.method = method;
		}

		if(!entityRoute.routes.map(m => m.methodName).includes(argv.method))
			throw new Error(`${argv.method} does not exist on ${argv.entity}.`);
		
		if(!argv.role) {
			roles.push("--Cancel--");
			const { perm } = await inquirer
				.prompt([
					{
						name: "perm",
						type: "list",
						message: `What role do you want to add to ${Chalk.blue.bold(
							argv.entity
						)}`,
						choices: roles,
						loop: false,
					},
				]);
			
			argv.role = perm;
		}

		if(!roles.find(v=>v===argv.role))
			throw new Error(`Please enter one of the following valid roles: ${roles}.`);

		const targetedRoute = entityRoute
		.routes.find(m => m.methodName === argv.method);

		if (argv.role === "--Cancel--") return;

		const finalEntity = {
			entity: pluralize.singular(argv.entity),
			methodName: argv.method,
			requestMethod: targetedRoute.requestMethod,
			path: targetedRoute.path,
			role: argv.role,
		};

		log.loading("Adding a perms in progress");
		await addPerms(finalEntity);
		await save();
		log.success("Permission successfully added");
	}
}
