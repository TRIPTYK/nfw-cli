import { Logger as Log } from "../utils"
import { exec as asyncExec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { rmdirSync } from "fs";
import { InitCommand } from "./initCommand";
import { readFile as readJsonFile, writeFile as writeJsonFile } from "jsonfile";

const exec = promisify(asyncExec);

export class NewCommand extends InitCommand {
    public command = "new <name>";
    public describe = "Creates a new project.";
    public aliases = ["n"];
    
    public builder = {
        ...this.builder,
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
        try {
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
            const pjson = await readJsonFile(join(argv.path, "package.json"));
            pjson.name = argv.name;
            pjson.version = "0.0.1";
            await writeJsonFile(join(argv.path, "package.json"), pjson);
            Log.success(`package.json personnalized.`);

            //Init the project
            if(!argv.noInit) 
                await super.handler(argv);

            Log.success("Your project is ready, have fun coding ! 💻");
            
        } catch (error) {
            Log.error("Something went wrong, here's a glimpse of the error:\n"+error);
        }
    }
}