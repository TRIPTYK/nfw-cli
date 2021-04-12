import { Logger as Log } from "../utils"
import { join } from "path";
import { rmdirSync } from "fs";
import { readFile as readJsonFile, writeFile as writeJsonFile } from "jsonfile";
import { BaseCommand } from "./template";
import { CommandsRegistry } from "../application";
import { promisifiedExec as exec } from "../utils/promisifiedExec";

export class NewCommand extends BaseCommand {
    public command = "new <name>";
    public describe = "Create a new project.";
    public aliases = ["n"];
    
    public builder = {
        ...CommandsRegistry.all.InitCommand.builder,
        path: {
            desc: "Path where to clone the project.",
            type: "string",
            default: ""
        },
        branch: {
            desc: "Get a version of the project from a specific branch.",
            type: "string",
            default: "master"
        },
        yarn: {
            desc: "Use yarn to fetch modules.",
            type: "boolean",
            default: false
        },
        noInit: {
            desc: "Keep the default configuration and doesn't configure the database (Override noInitDb).",
            type: "boolean",
            default: false
        }        
    }

    async handler (argv: any) {
        argv.path = join(process.cwd(), argv.path, argv.name);

        Log.info("Creation of a new NFW project.");

        //Cloning
        Log.loading("Cloning freshly baked NFW repository... 🍞");
        await exec(`git clone https://github.com/TRIPTYK/nfw.git --branch=${argv.branch} ${argv.path}`);
        Log.success("Repository cloned successfully !");

        //Removing .git
        rmdirSync(join(argv.path, '.git'), {
            recursive: true
        });

        //Yarn or npm i
        Log.loading(`Installing packages with ${(argv.yarn)? "yarn... 🐈" : "npm... 📦"}`);
        await exec(`
            cd ${argv.path}
            ${(argv.yarn) ? "yarn" : "npm i"}
            ./node_modules/.bin/pm2 install typescript
        `);
        Log.success(`Installation done !`);

        //Modification of package.json
        const pjson = join(argv.path, "package.json");
        const content = await readJsonFile(pjson);
        await writeJsonFile(pjson, {
            name: argv.name,
            version: "0.0.1",
            description: "NFW generated project !",
            main: content.main,
            scripts: content.scripts,
            author: "",
            license: "MIT",
            dependencies: content.dependencies,
            devDependencies: content.devDependencies,
            engines: content.engines
        }, {
           spaces: 4
        });

        //Init the project
        if(!argv.noInit) 
            await CommandsRegistry.all.InitCommand.handler(argv);

        Log.success("Your project is ready, have fun coding ! 💻");
    }
}