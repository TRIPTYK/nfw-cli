#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Commands from "./commands";

console.log(Commands);

yargs(hideBin(process.argv))
    .strict()
    .command(new Commands.Test())
    .command(new Commands.Banane())
    .scriptName('nfw')
    .argv