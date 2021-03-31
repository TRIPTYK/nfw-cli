#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Commands from "./commands";

let yargz = yargs(hideBin(process.argv));

for (const key in Commands) {
    if(key !== "BaseCommand") 
        yargz.command(new Commands[key]);
}  

yargz
    .strict()
    .demandCommand()
    .showHelpOnFail(true)
    .scriptName('nfw')
    .argv;
