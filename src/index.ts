#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CommandsRegistry } from "./application";
import { Logger as Log } from "./utils";

let yargz = yargs(hideBin(process.argv));

for (const command of CommandsRegistry.allValues)
	yargz.command(command);

yargz
	.strict()
	.demandCommand()
	.fail((message, error) => {
		if (message) {
			yargz.showHelp();
			Log.warning(message);
		}
		if (error)
			Log.error(
				`Something went wrong, here's a glimpse of the error:\n${
					error.message ?? error
				}`
			);
		process.exit(1);
	})
	.parserConfiguration({
		"dot-notation": false
	})
	.locale("en")
	.scriptName("nfw").argv;
