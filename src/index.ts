#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CommandsRegistry } from "./application";
import { Logger as Log } from "./utils";

CommandsRegistry.init();

let yargz = yargs(hideBin(process.argv));

for (const key in CommandsRegistry.all)
    yargz.command(CommandsRegistry.all[key]);

yargz
    .strict()
    .demandCommand()
    .fail((message, error) => {
        if(message) {
            yargz.showHelp();
            Log.warning(message);
        } 
        if(error)
            Log.error(`Something went wrong, here's a glimpse of the error:\n${error.message}`);
        process.exit(1);
    })
    .scriptName('nfw')
    .argv;
