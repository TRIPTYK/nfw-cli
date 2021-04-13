import { Logger as Log } from "../utils"
import { isAbsolute, join, sep } from "path";
import { readFile as readJsonFile, writeFile as writeJsonFile } from "jsonfile";
import { BaseCommand } from "./template";
import { CommandsRegistry } from "../application";
import { promisifiedExec as exec } from "../utils/promisifiedExec";
import * as degit from "degit";

export class NewCommand extends BaseCommand {
    public command = "new <path>";
    public describe = "Create a new project.";
    public aliases = ["n"];
    
    public builder = {
        ...CommandsRegistry.all.InitCommand.builder,
        branch: {
            desc: "Get a version of the project from a specific version/branch/commit hash.",
            type: "string",
            default: "master",
            alias: 'b'
        },
        yarn: {
            desc: "Use yarn to fetch modules.",
            type: "boolean",
            default: false
        },
        noInit: {
            desc: "Keep the default configuration and doesn't configure the database (Override noConfigDb).",
            type: "boolean",
            default: false
        },
        force: {
            desc: "Force the cloning of the repo.",
            alias: 'f',
            type: "boolean",
            default: false
        }
    }

    async handler (argv: any) {
        argv.path = join((isAbsolute(argv.path)?"":process.cwd()), argv.path);
        const projectName = argv.path.split(sep).slice(-1)[0];

        Log.info("Creation of a new NFW project.");
        
        //Cloning
        Log.loading("Cloning freshly baked NFW repository... 🍞");
        await degit(`TRIPTYK/nfw#${argv.branch}`, { 
            cache: true,
            force: argv.f ?? argv.force
        }).clone(argv.path);
        Log.success("Repository cloned successfully !");

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
            name: projectName,
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