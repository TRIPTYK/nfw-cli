#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Commands from "./commands";
import { BaseCommand } from "./commands";
import { Logger as Log } from "./utils";

let yargz = yargs(hideBin(process.argv));

for (const key in Commands) {
    const i = new Commands[key];
    if(key !== "BaseCommand" && i instanceof BaseCommand) 
        yargz.command(i);
}

yargz
    .strict()
    .demandCommand()
    .fail((message, error) => {
        if(message)
            console.log(message);
        if(error)
            Log.error(`Something went wrong, here's a glimpse of the error:\n${error.message}`);
        process.exit(1);
    })
    .showHelpOnFail(true)
    .scriptName('nfw')
    .argv;
