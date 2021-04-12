import { BaseCommand } from "./template";
import { addColumn, save } from "@triptyk/nfw-core";
import { Logger as log } from "../utils/log";

/**
 * Test
 */
export class AddColumnCommand extends BaseCommand {
	public command = "add-column <entity> <property> <type>";
	public aliases = ["adcol"];
	public describe = "Add a column in the target entity";

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
			type: "enum",
			default: "",
		},
	};

	async handler(argv: any) {
		const toSave = {
			name: argv.property,
			type: argv.type,
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

		log.loading("Adding a column in progress");
		await addColumn(argv.entity, toSave);
		await save();
		log.success("Column successfully added");
	}
}
