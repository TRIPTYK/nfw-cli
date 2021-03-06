import { BaseCommand } from "./template";
import * as fs from "fs";
import * as inquirer from "inquirer";
import { EnvFileWriter } from "../utils/env-file-rw";
import { strRandom } from "../utils/strRandom";
import { Logger as log } from "../utils/log";
import { join } from "path";
import * as mysql from "mysql2/promise";
import { CommandsRegistry } from "../application";
import { promisifiedExec as exec } from "../utils/promisifiedExec"
import { attemptAction, sleep } from "../utils/attempts";

export class InitCommand extends BaseCommand {
	public command = "init";
	public describe = "Initiation of environment variables and the database.";
	public aliases = ["ini"];

	public builder = {
        noInitDb : {
            desc: "Prohibits the connection to the MySQL server and the creation of the database and its tables.",
            type: "boolean",
            default: false
        },
		seed:{
			desc: "Populates database with some entries (only if noInitDb is false).",
			alias: 's',
			type: "boolean",
			default: false
		},
		docker: {
            desc: "Creates a simple configurated MySQL docker container (only if noInitDb is false).",
			alias: 'd',
            type: "boolean",
            default: false
        },
		yes: {
			desc: "Keeps the default values for the DB configuration.",
			alias: 'y',
            type: "boolean",
            default: false
		}
    };

	async handler(argv: any) {

		argv.yes = argv.y ?? argv.yes;
		argv.docker = argv.d ?? argv.docker;
		argv.seed = argv.s ?? argv.seed;

		const path: string = argv.path ?? process.cwd();
		const infos: {[key: string]: any} = {};

		// select only development.env files
		const envFile = fs
		.readdirSync(path)
		.find((file) => file.includes("development.env"));

		if (!envFile) throw "No development.env file has been found.";

		const rw = new EnvFileWriter(join(path, envFile));

		

		const arrayOfQuestions = {
			TYPEORM_HOST: "host name",
			TYPEORM_DB: "database name",
			TYPEORM_USER: "user name",
			TYPEORM_PWD: "password",
			TYPEORM_PORT: "port number",
			TYPEORM_SYNCHRONIZE: "synchronize",
			TYPEORM_LOGGING: "logging",
		};
		
		//DB configuration
		if(!argv.yes) {
			log.warning("You are editing the development.env file");
			const questions = [];

			for (const key in arrayOfQuestions) {
				if (key === "TYPEORM_SYNCHRONIZE" || key === "TYPEORM_LOGGING") {
					questions.push({
						name: key,
						type: "confirm",
						message: `Do you want to enable ${arrayOfQuestions[key]}`,
						default: rw.getNodeValue(key),
					});
				} else {
					questions.push({
						name: key,
						type: "input",
						message: `Insert a value for the ${arrayOfQuestions[key]}`,
						default: rw.getNodeValue(key),
					});
				}
			}

			await inquirer.prompt(questions).then((answer) => {
				for (const key in answer) {
					rw.setNodeValue(key, answer[key]);
					infos[key] = answer[key];
				}
				rw.setNodeValue(
					"JWT_SECRET",
					strRandom(80)
				);
				rw.setNodeValue(
					"OAUTH_SALT",
					strRandom(80)
				);
				rw.save();
			});
		}
		else {
			log.warning("Default values are used.");
			//default values
			for (const key in arrayOfQuestions) 
				infos[key] = rw.getNodeValue(key);
		}

		//Creation of docker
		if(argv.docker) {
			await CommandsRegistry.all.CreateDockerCommand.handler({
				name: infos.TYPEORM_DB,
				user: infos.TYPEORM_USER,
				password: infos.TYPEORM_PWD,
				port: infos.TYPEORM_PORT,
				nativePassword: true
			});
		}

		//Initiation of DB
		if(!argv.noInitDb) {
			const maxAttempt = 30;
			let useDb = true;
			let connection: mysql.Connection = null;
			infos.TYPEORM_DB = infos.TYPEORM_DB.replace(/[;=]/gm, '');

			try {
				await attemptAction(async (current) => {
					log.loading(`Attempt ${current}/${maxAttempt} of connection to the MySQL server... 🐬`);
					connection = await mysql.createConnection({
						host: infos.TYPEORM_HOST,
						user: infos.TYPEORM_USER,
						password: infos.TYPEORM_PWD,
						port: infos.TYPEORM_PORT
					});
					log.success("Connected to the MySQL server !");
				}, maxAttempt, 2000);

				if(!argv.docker) {
					const result: any[] = await connection.query("SHOW DATABASES LIKE ?", [infos.TYPEORM_DB])
					
					if(result[0].length) {
						log.warning(`The database ${infos.TYPEORM_DB} already exists.`);
						useDb = await inquirer.prompt([{
							name: "useDb",
							type: "confirm",
							message: "Do you want to create tables in it ?",
							default: false
						}])
						.then(answers => answers["useDb"]);
					}
					else {
						await connection.query(`CREATE DATABASE ${infos.TYPEORM_DB}`);
						log.success(`Database "${infos.TYPEORM_DB}" created successfully !`);
					}
				}

				if(useDb) {
					log.loading("Creation of tables in the database... 📝");
					await exec(`
						cd ${path}
						./node_modules/.bin/ts-node ./node_modules/typeorm/cli.js schema:sync
					`);
					log.success(`Tables of "${infos.TYPEORM_DB}" created successfully !`);
				}
				else
					log.warning("Skipping creation of tables...");
				
				if(argv.seed) {
					log.loading("Seeding tables... 🌱");
					await exec(`
						cd ${path}
						./node_modules/.bin/ts-node ./node_modules/typeorm-seeding/dist/cli.js seed
					`);
					log.success("Basic entries created !");
				}
	
				await connection.end();
			} 
			catch (error) {
				if(connection) await connection.end();
				throw error;
			}
		}

		

		log.success("Initiation done !");
	}
}
