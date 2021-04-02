#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Commands from "./commands";
import { BaseCommand } from "./commands";

let yargz = yargs(hideBin(process.argv));

for (const key in Commands) {
    const i = new Commands[key];
    if(key !== "BaseCommand" && i instanceof BaseCommand) 
        yargz.command(i);
}

yargz
    .strict()
    .demandCommand()
    .showHelpOnFail(true)
    .scriptName('nfw')
    .argv;
