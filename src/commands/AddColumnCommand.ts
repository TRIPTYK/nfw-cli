import { BaseCommand } from "./template";
import { addColumn, save, getSupportedTypes } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";
import * as inquirer from "inquirer";

/**
 * Test
 */
export class AddColumnCommand extends BaseCommand {
	public command = "add-column <entity> <propertyName>";
	public aliases = ["adcol"];
	public describe = "Adds a column in the target entity";

	public builder = {
		default: {
			desc: "Default value for the column",
			type: "string",
			default: "",
		},
		length: {
			desc: "Maximun length for the value",
			type: "number",
			default: "",
		},
		width: {
			desc: "Maximun width for the value",
			type: "number",
			default: "",
		},
		isUnique: {
			desc: "Value can be unique ?",
			type: "boolean",
			default: false,
		},
		isNullable: {
			desc: "Value can be nullable ?",
			type: "boolean",
			default: false,
		},
		scale: {
			desc: "Scale of the value",
			type: "number",
			default: "",
		},
		precision: {
			desc: "Precision of the value",
			type: "number",
			default: "",
		},
		now: {
			desc: "Set the date's default value to now",
			type: "boolean",
			default: false,
		},
		enums: {
			desc: "Set a enumeration for the column",
			type: "boolean",
			default: false,
		},
	};

	async handler(argv: any) {
		const types = await getSupportedTypes();

		await inquirer
			.prompt([
				{
					name: "type",
					type: "list",
					message: "Which type do you want to add ?",
					choices: types,
					loop: false,
				},
			])
			.then(async (answer) => {
				let toSave = {
					name: argv.propertyName,
					type: answer.type,
					default: argv.default,
					now: argv.now,
					length: argv.length,
					isUnique: argv.isUnique,
					isNullable: argv.isNullable,
					width: argv.width,
					scale: argv.scale,
					precision: argv.precision,
					enums: argv.enums,
				};
				if ((answer.type === "set" || answer.type === "enum") && argv.enums) {
					await inquirer
						.prompt([
							{
								name: "enum",
								type: "input",
								message: "Insert each value separated by a comma",
							},
						])
						.then((answer2) => {
							const array = answer2.enum.split(",");
							toSave.enums = array;
						});
				}
				if (answer.type === "bool" || answer.type === "boolean") {
					if (argv.default === "true") {
						toSave.default = 1;
					} else if (argv.default === "false") {
						toSave.default = 0;
					} else {
						toSave.default = 0;
					}
				}
				log.loading("Adding a column in progress");
				await addColumn(argv.entity, toSave);
				await save();
				log.success("Column successfully added");
			});
	}
}
