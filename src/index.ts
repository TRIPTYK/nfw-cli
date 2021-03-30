#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
    .strict()
    //commands here
    .scriptName('nfw')
    .argv