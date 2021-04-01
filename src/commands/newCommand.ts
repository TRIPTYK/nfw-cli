import { BaseCommand } from "./template";
import { prompt } from "inquirer";
import { Logger as Log, MessageType } from "../utils"
import { exec as asyncExec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { rmdirSync } from "fs";
import chalk = require("chalk");

const exec = promisify(asyncExec);

export class NewCommand extends BaseCommand {
    public command = "new <name>";
    public describe = "Creates a new project.";
    public aliases = ["n"];
    
    builder = (yargs): any => {
        yargs.option('path', {
            desc: "Path where to clone the project",
            type: "string",
            default: ""
        });
        yargs.option('branch', {
            desc: "Get a version of the project from a specific branch.",
            type: "string",
            default: "master"
        });
        yargs.option('yarn', {
            desc: "Use yarn to fetch modules.",
            type: "boolean",
            default: false
        });
    };

    async handler (argv: any) {
        try {
            argv.path = join(process.cwd(), argv.path, argv.name);

            Log.Loader.info("Creation of a new NFW project.");

            //Cloning
            Log.Loader.start("Cloning freshly baked NFW repository... 🍞");
            const clone = await exec(`git clone https://github.com/TRIPTYK/nfw.git --branch=${argv.branch} ${argv.path}`);
            if(!clone.stderr.length)
                throw clone.stderr;
            Log.Loader.succeed("Repository cloned successfully !");

            Log.Loader.start("Setting up the project... 🚧");
            //Removing .git
            Log.Loader.text = "Removing some things...";
            rmdirSync(join(argv.path, '.git'), {
                recursive: true
            });

            //Yarn or npm i
            Log.Loader.text = `Installing packages with ${(argv.yarn)? "yarn" : "npm"}...`;
            const install = await exec(`cd ${argv.path} && ${(argv.yarn) ? "yarn" : "npm i"}`);
            if(!install.stderr.length) 
                throw install.stderr;

            Log.Loader.succeed(`Your project ${argv.name} is ready, have fun coding !`);
            
            
        } catch (error) {
            Log.Loader.fail("Something went wrong, here's a glimpse of the error:\n"+error);
        }

    }
}