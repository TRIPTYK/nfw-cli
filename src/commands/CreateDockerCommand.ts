import { promisifiedExec as exec } from "../utils/promisifiedExec";
import { Logger as Log } from "../utils";
import { BaseCommand } from "./template";

export class CreateDockerCommand extends BaseCommand {
    public command: string | string[] = "docker <name>";
    public aliases = ["dock"]
    public describe = "Creates a MySQL container with a database of the same name inside."

    public builder = {
        port: {
            desc: "Listening port of the server.",
            type: "number",
            default: 3306
        },
        user: {
            desc: "Username of the created user.",
            type: "string",
            default: "user"
        },
        password: {
            desc: "Password of the user.",
            type: "string",
            default: "password"
        },
        rootPassword: {
            desc: "Password of root.",
            type: "string",
            default: "root"
        },
        nativePassword: {
            desc: "Sets the default authentication plugin to mysql_native_password (useful for development purpose).",
            type: "boolean",
            default: false
        },
        noRun: {
            desc: "Only creates the container, without running it.",
            type: "boolean",
            default: false
        },
        noDb: {
            desc: "Prevents the creation of the db in the container.",
            type: "boolean",
            default: false
        }
    }

    public async handler(argv: any) {

        let envs = `
            -e MYSQL_USER=${argv.user}
            -e MYSQL_PASSWORD=${argv.password}
            -e MYSQL_ROOT_PASSWORD=${argv.rootPassword} 
        `;
        if(argv.user === "root") {
            Log.warning("You're using root as only user.");
            envs = `-e MYSQL_ROOT_PASSWORD=${argv.password}`;
        }
        if(!argv.noDb) {
            envs += `\n-e MYSQL_DATABASE=${argv.name}`;
        }

        const command = `docker 
            ${(argv.noRun)? "create": "run -d"} 
            -p ${argv.port}:3306 
            --name ${argv.name} 
            ${envs}
            mysql:latest
            mysqld
            ${(argv.nativePassword)?"--default-authentication-plugin=mysql_native_password":""}
        `;

        Log.loading(`Creation of the container "${argv.name}"... 🐳`);
        await exec(command.replace(/[\n\t\r]/gm, ' '));
        Log.success(`Container "${argv.name}" created with success !`);

        if(!argv.noRun)
            Log.info(`Your container "${argv.name}" is now running and listening to port ${argv.port}.`);
    }
}