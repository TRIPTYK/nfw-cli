import { Logger as Log } from "../utils"
import { exec as asyncExec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { rmdirSync } from "fs";
import { readFile as readJsonFile, writeFile as writeJsonFile } from "jsonfile";
import { BaseCommand } from "./template";
import { CommandsRegistry } from "../application";

const exec = promisify(asyncExec);

export class NewCommand extends BaseCommand {
    public command = "new <name>";
    public describe = "Creates a new project.";
    public aliases = ["n"];
    
    public builder = {
        ...CommandsRegistry.all.InitCommand.builder,
        path: {
            desc: "Path where to clone the project.",
            type: "string",
            default: ""
        },
        branch: {
            desc: "Gets a version of the project from a specific branch.",
            type: "string",
            default: "master"
        },
        yarn: {
            desc: "Uses yarn to fetch modules.",
            type: "boolean",
            default: false
        },
        noInit: {
            desc: "Keeps the default configuration and doesn't configure the database.",
            type: "boolean",
            default: false
        }        
    }

    async handler (argv: any) {
        argv.path = join(process.cwd(), argv.path, argv.name);

        Log.info("Creation of a new NFW project.");

        //Cloning
        Log.loading("Cloning freshly baked NFW repository... 🍞");
        const clone = await exec(`git clone https://github.com/TRIPTYK/nfw.git --branch=${argv.branch} ${argv.path}`);
        if(!clone.stderr.length)
            throw clone.stderr;
        Log.success("Repository cloned successfully !");

        //Removing .git
        rmdirSync(join(argv.path, '.git'), {
            recursive: true
        });

        //Yarn or npm i
        Log.loading(`Installing packages with ${(argv.yarn)? "yarn... 🐈" : "npm... 📦"}`);
        const install = await exec(`cd ${argv.path} && ${(argv.yarn) ? "yarn" : "npm i"}`);
        if(!install.stderr.length) 
            throw install.stderr;
        Log.success(`Installation done !`);

        //Modification of package.json
        const pjson = join(argv.path, "package.json");
        await writeJsonFile(pjson, {
            ...readJsonFile(pjson),
            name: argv.name,
            version: "0.0.1",
        });

        //Init the project
        if(!argv.noInit) 
            await CommandsRegistry.all.InitCommand.handler(argv);

        Log.success("Your project is ready, have fun coding ! 💻");
    }
}